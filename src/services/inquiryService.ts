import {
  addDoc,
  collection,
  doc,
  getDocs,
  increment,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import { mockChecklists } from '../mock/checklists'
import { mockFaqEntries } from '../mock/faqEntries'
import { mockInquiries } from '../mock/inquiries'
import { mockNotices } from '../mock/notices'
import { presetQuestions } from '../mock/presetQuestions'
import {
  CATEGORIES,
  type Category,
  type CategoryId,
  type Checklist,
  type FaqEntry,
  type Inquiry,
  type Notice,
  type PresetQuestion,
} from '../types/academic'
import { firestore, isFirebaseConfigured } from './firebase'

const toMillis = (value: unknown): number => {
  if (value instanceof Timestamp) return value.toMillis()
  if (typeof value === 'number') return value
  if (typeof value === 'string') return new Date(value).getTime()
  return Date.now()
}

const isCategoryId = (value: unknown): value is CategoryId =>
  value === 'transfer' || value === 'course' || value === 'leave' || value === 'etc'

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
    console.warn(`Failed to load ${name} from Firestore. Falling back to mock data.`, error)
    return fallback
  }
}

export const isFirestoreConfigured = isFirebaseConfigured

export const getCategories = () =>
  readCollection<Category>('categories', CATEGORIES, (snapshot) => {
    const data = snapshot.data()
    const id = isCategoryId(data.id) ? data.id : (snapshot.id as CategoryId)
    return {
      id,
      label: String(data.label ?? ''),
      description: String(data.description ?? ''),
      phone: String(data.phone ?? ''),
      hours: String(data.hours ?? ''),
      order: Number(data.order ?? 0),
    }
  })

export const getKeywordPresets = () =>
  readCollection<PresetQuestion>('keywordPresets', presetQuestions, (snapshot) => {
    const data = snapshot.data()
    return {
      id: String(data.id ?? snapshot.id),
      category: isCategoryId(data.categoryId) ? data.categoryId : isCategoryId(data.category) ? data.category : 'etc',
      text: String(data.label ?? data.text ?? ''),
      order: Number(data.order ?? 0),
    }
  })

export const getFaqEntries = () =>
  readCollection<FaqEntry>('faqEntries', mockFaqEntries, (snapshot) => {
    const data = snapshot.data()
    return {
      id: String(data.id ?? snapshot.id),
      category: isCategoryId(data.categoryId) ? data.categoryId : isCategoryId(data.category) ? data.category : 'etc',
      question: String(data.question ?? ''),
      answer: String(data.answer ?? ''),
      answerImageUrls: Array.isArray(data.answerImageUrls) ? data.answerImageUrls.map(String) : [],
      relatedNoticeIds: Array.isArray(data.relatedNoticeIds) ? data.relatedNoticeIds.map(String) : [],
      order: Number(data.order ?? 0),
      pinned: Boolean(data.pinned),
      viewCount: Number(data.viewCount ?? 0),
      updatedAt: toMillis(data.updatedAt),
    }
  })

export const getChecklists = () =>
  readCollection<Checklist>('checklists', mockChecklists, (snapshot) => {
    const data = snapshot.data()
    const rawItems = Array.isArray(data.items) ? data.items : []
    return {
      id: String(data.id ?? snapshot.id),
      category: isCategoryId(data.categoryId) ? data.categoryId : isCategoryId(data.category) ? data.category : 'etc',
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

export const getInitialNotices = async (): Promise<Notice[]> =>
  readCollection<Notice>('notices', mockNotices, (snapshot) => {
    const data = snapshot.data()
    return {
      id: String(data.id ?? snapshot.id),
      category: isCategoryId(data.categoryId) ? data.categoryId : isCategoryId(data.category) ? data.category : 'etc',
      title: String(data.title ?? ''),
      url: String(data.url ?? '#'),
      postedAt: toMillis(data.postedAt ?? data.createdAt),
    }
  }, false)

export const getInitialInquiries = async (): Promise<Inquiry[]> =>
  readCollection<Inquiry>('inquiries', mockInquiries, (snapshot) => {
    const data = snapshot.data()
    return {
      id: String(data.id ?? snapshot.id),
      source: data.source === 'phone' ? 'phone' : 'chat',
      category: isCategoryId(data.categoryId) ? data.categoryId : isCategoryId(data.category) ? data.category : 'etc',
      questionText: String(data.keyword ?? data.questionText ?? data.detail ?? ''),
      status: data.status === 'answered' ? 'answered' : 'pending',
      answerText: typeof data.answerText === 'string' ? data.answerText : undefined,
      relatedNoticeIds: Array.isArray(data.relatedNoticeIds) ? data.relatedNoticeIds.map(String) : undefined,
      createdAt: toMillis(data.createdAt),
      answeredAt: data.answeredAt ? toMillis(data.answeredAt) : undefined,
    }
  }, false)

export const createLocalInquiry = (
  source: 'chat' | 'phone',
  category: CategoryId,
  questionText: string,
): Inquiry => {
  const now = Date.now()
  return {
    id: `local-${now}-${Math.random().toString(36).slice(2, 8)}`,
    source,
    category,
    questionText,
    status: 'pending',
    createdAt: now,
  }
}

export const createChatInquiry = async (
  category: CategoryId,
  keyword: string,
  detail?: string,
  conversationId?: string,
): Promise<Inquiry> => {
  const local = createLocalInquiry('chat', category, keyword)
  if (!firestore) return local

  const docRef = await addDoc(collection(firestore, 'inquiries'), {
    source: 'chat',
    categoryId: category,
    keyword,
    detail: detail ?? '',
    status: 'pending',
    conversationId: conversationId ?? null,
    createdAt: serverTimestamp(),
  })

  return { ...local, id: docRef.id }
}

// FAQ 조회수 증가. 세션 내 중복 카운트는 호출부(localStorage)에서 방지한다.
export const incrementFaqView = async (faqId: string): Promise<void> => {
  if (!firestore) return
  try {
    await updateDoc(doc(firestore, 'faqEntries', faqId), { viewCount: increment(1) })
  } catch (error) {
    console.warn('Failed to increment FAQ view count.', error)
  }
}
