import { signInAnonymously } from 'firebase/auth'
import {
  addDoc,
  collection,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore'
import type { CategoryId, ChatMessage } from '../types/academic'
import { firebaseAuth, firestore } from './firebase'

export type AiAnswer = {
  answer: string
  confident: boolean
  relatedNoticeIds: string[]
}

export type AiChatPayload = {
  categoryLabel: string
  kb: {
    faqs: { id: string; question: string; answer: string }[]
    notices: { id: string; title: string; body?: string }[]
    checklist: { label: string; content: string }[]
    contacts?: { team: string; topic: string; phone: string }[]
    phone?: string
    hours?: string
  }
  history: { role: 'user' | 'assistant'; content: string }[]
}

const toMillis = (value: unknown): number => {
  if (value instanceof Timestamp) return value.toMillis()
  if (typeof value === 'number') return value
  return Date.now()
}

// 학생 익명 로그인. studentId(uid)를 반환하며, 실패하거나 미설정이면 null.
export const ensureAnonymousAuth = async (): Promise<string | null> => {
  if (!firebaseAuth) return null
  if (firebaseAuth.currentUser) return firebaseAuth.currentUser.uid
  try {
    const credential = await signInAnonymously(firebaseAuth)
    return credential.user.uid
  } catch (error) {
    console.warn('익명 로그인에 실패했습니다. 채팅 기록이 저장되지 않습니다.', error)
    return null
  }
}

// 새 대화 생성. Firestore 미설정 시 로컬 임시 id를 반환한다.
export const createConversation = async (
  category: CategoryId,
  studentName: string,
  studentNumber: string,
  studentDepartment: string,
): Promise<string | null> => {
  if (!firestore) return null
  const studentId = await ensureAnonymousAuth()
  if (!studentId) return null

  const ref = await addDoc(collection(firestore, 'conversations'), {
    studentId,
    studentName,
    studentNumber,
    studentDepartment,
    category,
    status: 'open',
    lastMessage: '',
    lastMessageAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    unreadForAdmin: false,
    unreadForStudent: false,
    needsHuman: false,
    studentMessageCount: 0,
  })
  return ref.id
}

// 학생/봇/AI 메시지 전송 + 대화 메타 갱신.
export const sendStudentMessage = async (
  conversationId: string,
  from: 'student' | 'bot' | 'ai',
  text: string,
): Promise<void> => {
  if (!firestore) return
  const conversationRef = doc(firestore, 'conversations', conversationId)
  const messagesRef = collection(conversationRef, 'messages')

  await addDoc(messagesRef, {
    from,
    text,
    createdAt: serverTimestamp(),
  })

  await updateDoc(conversationRef, {
    lastMessage: text,
    lastMessageAt: serverTimestamp(),
    // 학생이 보낸 메시지는 관리자에게 미확인으로 표시(봇 자동응답은 제외).
    // 실제 학생 발화 수를 세어, 자동 안내만 있는 빈 대화를 관리자 목록에서 숨기는 데 쓴다.
    ...(from === 'student' ? { unreadForAdmin: true, studentMessageCount: increment(1) } : {}),
  })
}

// 대화의 메시지를 실시간 구독. 해제 함수를 반환한다.
export const subscribeMessages = (
  conversationId: string,
  onChange: (messages: ChatMessage[]) => void,
): (() => void) => {
  if (!firestore) return () => {}
  const messagesRef = collection(doc(firestore, 'conversations', conversationId), 'messages')
  return onSnapshot(query(messagesRef, orderBy('createdAt', 'asc')), (snapshot) => {
    const messages = snapshot.docs.map((docSnapshot): ChatMessage => {
      const data = docSnapshot.data()
      const from =
        data.from === 'admin' ? 'admin' : data.from === 'bot' ? 'bot' : data.from === 'ai' ? 'ai' : 'student'
      return {
        id: docSnapshot.id,
        from,
        text: String(data.text ?? ''),
        imageUrls: Array.isArray(data.imageUrls) ? data.imageUrls.map(String) : undefined,
        createdAt: toMillis(data.createdAt),
      }
    })
    onChange(messages)
  })
}

// 학생이 대화를 열어볼 때 자신에게 온 미확인 표시를 해제.
export const markConversationReadByStudent = async (conversationId: string): Promise<void> => {
  if (!firestore) return
  try {
    await setDoc(
      doc(firestore, 'conversations', conversationId),
      { unreadForStudent: false },
      { merge: true },
    )
  } catch (error) {
    console.warn('대화 읽음 처리에 실패했습니다.', error)
  }
}

// AI가 답하기 어려운 문의를 관리자에게 넘긴다.
export const escalateToHuman = async (conversationId: string): Promise<void> => {
  if (!firestore) return
  try {
    await setDoc(
      doc(firestore, 'conversations', conversationId),
      { needsHuman: true, unreadForAdmin: true },
      { merge: true },
    )
  } catch (error) {
    console.warn('상담원 연결 처리에 실패했습니다.', error)
  }
}

// 서버 프록시(/api/chat)를 통해 OpenAI 답변을 받는다.
export const askAi = async (payload: AiChatPayload): Promise<AiAnswer> => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error(`AI 응답 실패: ${response.status}`)
  }
  const data = (await response.json()) as Partial<AiAnswer>
  return {
    answer: String(data.answer ?? ''),
    confident: Boolean(data.confident),
    relatedNoticeIds: Array.isArray(data.relatedNoticeIds) ? data.relatedNoticeIds : [],
  }
}
