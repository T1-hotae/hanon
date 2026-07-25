// firebase-admin(관리자 SDK)로 seed 한다. Google ADC 인증이 필요하다.
// (gcloud auth application-default login 또는 GOOGLE_APPLICATION_CREDENTIALS 서비스계정 키)
// ADC 설정 없이 .env + 관리자 로그인으로 넣으려면 `npm run seed:web`을 사용하세요.
import admin from 'firebase-admin'
import { readEnv } from './read-env.mjs'
import { categories, checklists, notices, faqEntries, contacts, departments } from './seed-data.mjs'

const env = readEnv()
const projectId = process.env.FIREBASE_PROJECT_ID ?? env.VITE_FIREBASE_PROJECT_ID

if (!projectId) {
  console.error('FIREBASE_PROJECT_ID(또는 .env의 VITE_FIREBASE_PROJECT_ID)가 필요합니다.')
  process.exit(1)
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId,
  })
}

const db = admin.firestore()

const upsertAll = async (collectionName, rows) => {
  const batch = db.batch()
  rows.forEach((row) => {
    const { id, ...data } = row
    batch.set(db.collection(collectionName).doc(id), {
      ...data,
      id,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true })
  })
  await batch.commit()
  console.log(`Seeded ${collectionName}: ${rows.length}`)
}

await upsertAll('categories', categories)
await upsertAll('checklists', checklists)
await upsertAll('notices', notices)
await upsertAll('faqEntries', faqEntries)
await upsertAll('contacts', contacts)
await upsertAll('departments', departments)
