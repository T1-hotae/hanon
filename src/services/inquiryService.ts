import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { mockInquiries } from '../mock/inquiries'
import { mockNotices } from '../mock/notices'
import type { CategoryId, Inquiry, Notice } from '../types/academic'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const hasFirebaseConfig = Object.values(firebaseConfig).every(Boolean)

let app: FirebaseApp | undefined
let db: Firestore | undefined

if (hasFirebaseConfig) {
  app = initializeApp(firebaseConfig)
  db = getFirestore(app)
}

export const isFirestoreConfigured = () => Boolean(db)

// Firestore access is intentionally isolated in this file so the prototype can
// run from mock data today and switch persistence later without touching views.
export const getInitialInquiries = async (): Promise<Inquiry[]> => {
  if (!db) return mockInquiries
  return mockInquiries
}

export const getInitialNotices = async (): Promise<Notice[]> => {
  if (!db) return mockNotices
  return mockNotices
}

export const createInquiry = (
  source: 'chat' | 'phone',
  category: CategoryId,
  questionText: string,
  answer?: { answerText: string; relatedNoticeIds: string[] },
): Inquiry => {
  const now = Date.now()
  return {
    id: `local-${now}-${Math.random().toString(36).slice(2, 8)}`,
    source,
    category,
    questionText,
    status: answer ? 'answered' : 'pending',
    createdAt: now,
    answerText: answer?.answerText,
    relatedNoticeIds: answer?.relatedNoticeIds,
    answeredAt: answer ? now : undefined,
  }
}

export const createPhoneInquiry = (category: CategoryId, questionText: string): Inquiry =>
  createInquiry('phone', category, questionText)
