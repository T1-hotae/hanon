import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const ADMIN_LOGIN_EMAIL =
  import.meta.env.VITE_ADMIN_LOGIN_EMAIL ?? 'admin@han-non-e.internal'

const hasFirebaseConfig = Object.values(firebaseConfig).every(Boolean)

let app: FirebaseApp | undefined
let db: Firestore | undefined
let auth: Auth | undefined
let storage: FirebaseStorage | undefined

if (hasFirebaseConfig) {
  app = initializeApp(firebaseConfig)
  db = getFirestore(app)
  auth = getAuth(app)
  storage = getStorage(app)
}

export const firebaseApp = app
export const firestore = db
export const firebaseAuth = auth
export const firebaseStorage = storage
export const isFirebaseConfigured = () => Boolean(app && db)
