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
  where,
  writeBatch,
} from 'firebase/firestore'
import type { CategoryId, ChatMessage } from '../types/academic'
import type { StudentIdentity } from '../utils/studentIdentity'
import { firebaseAuth, firestore } from './firebase'

export type AiAnswer = {
  answer: string
  confident: boolean
  relatedNoticeIds: string[]
}

// 채팅은 학사 항목을 구분하지 않으므로 전체 학사 자료를 그대로 보낸다.
export type AiChatPayload = {
  kb: {
    faqs: { id: string; question: string; answer: string }[]
    notices: { id: string; title: string; body?: string }[]
    checklist: { label: string; content: string }[]
    contacts?: { team: string; topic: string; phone: string }[]
    categories?: { label: string; phone?: string; hours?: string }[]
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

// 새 AI 대화 생성. Firestore 미설정 시 null(로컬 데모 모드)을 반환한다.
// AI 대화와 상담사 대화는 완전히 분리된 별개의 대화다. needsHuman은 생성 이후 바뀌지 않는다.
// 학생 식별정보(학번·학과·이름)는 AI 대화에서 받지 않는다(상담사 대화에서만 받는다).
// 학사 항목(category)도 시작 시점에 고르지 않는다. 첫 질문에서 추정해 setConversationCategory로 채운다.
// 제목(title)도 마찬가지로 빈 값으로 두고, 첫 질문이 들어올 때 setConversationTitle로 채운다.
export const createConversation = async (): Promise<string | null> => {
  if (!firestore) return null
  const studentId = await ensureAnonymousAuth()
  if (!studentId) return null

  const ref = await addDoc(collection(firestore, 'conversations'), {
    studentId,
    studentName: '',
    studentNumber: '',
    studentDepartment: '',
    studentDepartmentId: '',
    category: '',
    title: '',
    status: 'open',
    lastMessage: '',
    lastMessageAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    unreadForAdmin: false,
    unreadForStudent: false,
    needsHuman: false,
    studentMessageCount: 0,
    hiddenForStudent: false,
  })
  return ref.id
}

// 상담사 전용 대화 생성. AI 대화를 승격시키는 대신 항상 새 대화로 시작해 둘을 섞지 않는다.
// 학생 식별정보는 처음부터 채워 두어 관리자가 첫 문의와 함께 바로 확인할 수 있게 한다.
// unreadForAdmin은 여기서 올리지 않는다. 학생이 실제로 문의를 남길 때 sendStudentMessage가 올린다.
export const createHumanConversation = async (
  identity: StudentIdentity,
  sourceConversationId?: string,
): Promise<string | null> => {
  if (!firestore) return null
  const studentId = await ensureAnonymousAuth()
  if (!studentId) return null

  const ref = await addDoc(collection(firestore, 'conversations'), {
    studentId,
    ...identity,
    category: '',
    title: '',
    status: 'open',
    lastMessage: '',
    lastMessageAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    unreadForAdmin: false,
    unreadForStudent: false,
    needsHuman: true,
    studentMessageCount: 0,
    hiddenForStudent: false,
    // 어느 AI 대화에서 넘어왔는지 추적용(학생 화면에는 쓰지 않는다).
    ...(sourceConversationId ? { sourceConversationId } : {}),
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

export type ConversationSummary = {
  id: string
  category: CategoryId
  // 대화 제목 = 학생이 처음 보낸 질문(제목이 아직 없는 옛 대화는 빈 문자열).
  title: string
  lastMessage: string
  lastMessageAt: number
  needsHuman: boolean
  // 학생이 '기록 초기화'로 목록에서 지운 대화. 상담 기록 자체는 관리자 쪽에 남는다.
  hiddenForStudent: boolean
}

// 현재(익명) 학생의 대화 목록을 실시간 구독한다. 왼쪽 '채팅 기록' 패널에 사용.
// 복합 색인을 피하려고 studentId 필터만 서버에서 걸고 정렬은 클라이언트에서 한다.
export const subscribeStudentConversations = (
  studentId: string,
  onChange: (items: ConversationSummary[]) => void,
): (() => void) => {
  if (!firestore) return () => {}
  const conversationsRef = collection(firestore, 'conversations')
  return onSnapshot(query(conversationsRef, where('studentId', '==', studentId)), (snapshot) => {
    const items = snapshot.docs
      .map((docSnapshot): ConversationSummary => {
        const data = docSnapshot.data()
        return {
          id: docSnapshot.id,
          category: String(data.category ?? '') as CategoryId,
          title: String(data.title ?? ''),
          lastMessage: String(data.lastMessage ?? ''),
          lastMessageAt: toMillis(data.lastMessageAt),
          needsHuman: Boolean(data.needsHuman),
          hiddenForStudent: Boolean(data.hiddenForStudent),
        }
      })
      // 아직 아무 메시지도 없는 빈 대화, 학생이 기록에서 지운 대화는 목록에서 숨긴다.
      .filter((item) => item.lastMessage.trim().length > 0 && !item.hiddenForStudent)
      .sort((a, b) => b.lastMessageAt - a.lastMessageAt)
    onChange(items)
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

// 첫 질문에서 추정한 학사 항목을 대화에 기록한다(관리자 통계·분류용, 화면에는 쓰지 않는다).
export const setConversationCategory = async (
  conversationId: string,
  category: CategoryId,
): Promise<void> => {
  if (!firestore) return
  try {
    await setDoc(doc(firestore, 'conversations', conversationId), { category }, { merge: true })
  } catch (error) {
    console.warn('대화 분류 저장에 실패했습니다.', error)
  }
}

// 채팅 기록 초기화: 학생 목록에서만 감춘다(hiddenForStudent).
// 상담사 대화까지 실제로 삭제하면 관리자 쪽 상담 이력이 사라지고, 규칙상 delete도 관리자 전용이다.
export const clearStudentConversations = async (conversationIds: string[]): Promise<void> => {
  if (!firestore || conversationIds.length === 0) return
  try {
    // 배치 한 번의 상한(500)에 맞춰 나눠 쓴다.
    for (let index = 0; index < conversationIds.length; index += 400) {
      const batch = writeBatch(firestore)
      for (const conversationId of conversationIds.slice(index, index + 400)) {
        batch.update(doc(firestore, 'conversations', conversationId), { hiddenForStudent: true })
      }
      await batch.commit()
    }
  } catch (error) {
    console.warn('채팅 기록 초기화에 실패했습니다.', error)
  }
}

// 대화 제목은 학생이 처음 보낸 질문으로 만든다. 너무 길면 잘라 목록에서 한 줄로 보이게 한다.
export const CONVERSATION_TITLE_MAX = 40

export const buildConversationTitle = (text: string): string => {
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (normalized.length <= CONVERSATION_TITLE_MAX) return normalized
  return `${normalized.slice(0, CONVERSATION_TITLE_MAX).trimEnd()}…`
}

// 첫 질문을 대화 제목으로 저장한다(채팅 기록 목록·채팅 헤더에 표시).
export const setConversationTitle = async (
  conversationId: string,
  title: string,
): Promise<void> => {
  if (!firestore || !title) return
  try {
    await setDoc(doc(firestore, 'conversations', conversationId), { title }, { merge: true })
  } catch (error) {
    console.warn('대화 제목 저장에 실패했습니다.', error)
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
