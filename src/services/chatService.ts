import { signInAnonymously } from 'firebase/auth'
import {
  addDoc,
  collection,
  doc,
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
export const createConversation = async (category: CategoryId): Promise<string | null> => {
  if (!firestore) return null
  const studentId = await ensureAnonymousAuth()
  if (!studentId) return null

  const ref = await addDoc(collection(firestore, 'conversations'), {
    studentId,
    category,
    status: 'open',
    lastMessage: '',
    lastMessageAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    unreadForAdmin: false,
    unreadForStudent: false,
  })
  return ref.id
}

// 학생/봇 메시지 전송 + 대화 메타 갱신.
export const sendStudentMessage = async (
  conversationId: string,
  from: 'student' | 'bot',
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
    ...(from === 'student' ? { unreadForAdmin: true } : {}),
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
      return {
        id: docSnapshot.id,
        from: data.from === 'admin' ? 'admin' : data.from === 'bot' ? 'bot' : 'student',
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
