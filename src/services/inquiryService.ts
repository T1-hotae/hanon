import {
  addDoc,
  collection,
  doc,
  getDocs,
  increment,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import {
  type Category,
  type CategoryId,
  type Checklist,
  type Contact,
  type FaqEntry,
  type Notice,
} from '../types/academic'
import { firestore, isFirebaseConfigured } from './firebase'

const toMillis = (value: unknown): number => {
  if (value instanceof Timestamp) return value.toMillis()
  if (typeof value === 'number') return value
  if (typeof value === 'string') return new Date(value).getTime()
  return Date.now()
}

// 카테고리는 Firestore(관리자 앱)에서 자유롭게 추가된다. 알려진 ID로 제한하지 않고
// 저장된 categoryId를 그대로 사용한다. (없을 때만 'etc'로 폴백)
const readCategoryId = (data: DocumentData): CategoryId =>
  String(data.categoryId ?? data.category ?? 'etc')

const readCollection = async <T>(
  name: string,
  fallback: T[],
  mapper: (snapshot: QueryDocumentSnapshot<DocumentData>) => T,
  ordered = true,
): Promise<T[]> => {
  if (!firestore) return fallback

  try {
    const ref = collection(firestore, name)
    const snapshots = await getDocs(ordered ? query(ref, orderBy('order', 'asc')) : ref)
    const items = snapshots.docs.map(mapper)
    return items.length ? items : fallback
  } catch (error) {
    console.warn(`Failed to load ${name} from Firestore. Returning empty list.`, error)
    return fallback
  }
}

export const isFirestoreConfigured = isFirebaseConfigured

export const getCategories = () =>
  readCollection<Category>('categories', [], (snapshot) => {
    const data = snapshot.data()
    const id = String(data.id ?? snapshot.id)
    return {
      id,
      label: String(data.label ?? ''),
      description: String(data.description ?? ''),
      phone: String(data.phone ?? ''),
      hours: String(data.hours ?? ''),
      order: Number(data.order ?? 0),
    }
  })

export const getFaqEntries = () =>
  readCollection<FaqEntry>('faqEntries', [], (snapshot) => {
    const data = snapshot.data()
    return {
      id: String(data.id ?? snapshot.id),
      category: readCategoryId(data),
      question: String(data.question ?? ''),
      answer: String(data.answer ?? ''),
      answerImageUrls: Array.isArray(data.answerImageUrls) ? data.answerImageUrls.map(String) : [],
      relatedNoticeIds: Array.isArray(data.relatedNoticeIds) ? data.relatedNoticeIds.map(String) : [],
      order: Number(data.order ?? 0),
      pinned: Boolean(data.pinned),
      showOnHome: Boolean(data.showOnHome),
      viewCount: Number(data.viewCount ?? 0),
      updatedAt: toMillis(data.updatedAt),
    }
  })

export const getChecklists = () =>
  readCollection<Checklist>('checklists', [], (snapshot) => {
    const data = snapshot.data()
    const rawItems = Array.isArray(data.items) ? data.items : []
    return {
      id: String(data.id ?? snapshot.id),
      category: readCategoryId(data),
      order: Number(data.order ?? 0),
      items: rawItems
        .map((item, index) => ({
          id: String(item.id ?? `${snapshot.id}-${index}`),
          label: String(item.label ?? ''),
          content: String(item.content ?? ''),
          order: Number(item.order ?? index),
        }))
        .sort((a, b) => a.order - b.order),
    }
  })

export const getContacts = () =>
  readCollection<Contact>('contacts', [], (snapshot) => {
    const data = snapshot.data()
    return {
      id: String(data.id ?? snapshot.id),
      team: String(data.team ?? ''),
      topic: String(data.topic ?? ''),
      ext: String(data.ext ?? ''),
      phone: String(data.phone ?? ''),
      group: String(data.group ?? '기타'),
      categories: Array.isArray(data.categories) ? data.categories.map(String) : [],
      priority: Number(data.priority ?? 2),
      order: Number(data.order ?? 999),
    }
  })

export const getInitialNotices = async (): Promise<Notice[]> =>
  readCollection<Notice>('notices', [], (snapshot) => {
    const data = snapshot.data()
    return {
      id: String(data.id ?? snapshot.id),
      category: readCategoryId(data),
      title: String(data.title ?? ''),
      url: String(data.url ?? '#'),
      postedAt: toMillis(data.postedAt ?? data.createdAt),
      order: Number(data.order ?? 999),
      viewCount: Number(data.viewCount ?? 0),
    }
  }, false)

// 대화(conversationId)당 문의를 정확히 하나만 남긴다 — 문서 id를 conversationId로 고정해
// 여러 메시지가 오가도 같은 문서에 덮어써지도록 한다(대화의 첫 메시지가 대표 키워드가 됨).
export const createChatInquiry = async (
  category: CategoryId,
  keyword: string,
  conversationId: string,
): Promise<void> => {
  if (!firestore) return
  try {
    await setDoc(doc(firestore, 'inquiries', conversationId), {
      source: 'chat',
      categoryId: category,
      keyword,
      detail: '',
      status: 'pending',
      conversationId,
      createdAt: serverTimestamp(),
    })
  } catch (error) {
    console.warn('Failed to record chat inquiry.', error)
  }
}

// FAQ 조회수 증가. 세션 내 중복 카운트는 호출부(localStorage)에서 방지한다.
export const createPhoneInquiry = async (
  category: CategoryId,
  keyword: string,
  phone: string,
): Promise<void> => {
  if (!firestore) return
  try {
    await addDoc(collection(firestore, 'inquiries'), {
      source: 'phone',
      categoryId: category,
      keyword,
      detail: phone,
      status: 'pending',
      createdAt: serverTimestamp(),
    })
  } catch (error) {
    console.warn('Failed to record phone inquiry.', error)
  }
}

export const incrementFaqView = async (faqId: string): Promise<void> => {
  if (!firestore) return
  try {
    await updateDoc(doc(firestore, 'faqEntries', faqId), { viewCount: increment(1) })
  } catch (error) {
    console.warn('Failed to increment FAQ view count.', error)
  }
}

// 공지 조회수 증가. 세션 내 중복 카운트는 호출부(sessionStorage)에서 방지한다.
export const incrementNoticeView = async (noticeId: string): Promise<void> => {
  if (!firestore) return
  try {
    await updateDoc(doc(firestore, 'notices', noticeId), { viewCount: increment(1) })
  } catch (error) {
    console.warn('Failed to increment notice view count.', error)
  }
}
