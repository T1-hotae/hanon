import admin from 'firebase-admin'

const projectId = process.env.FIREBASE_PROJECT_ID
const confirmed = process.argv.includes('--confirm')

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId,
  })
}

const db = admin.firestore()

// conversations는 recursiveDelete가 하위 messages 서브컬렉션까지 함께 지운다.
const collections = [
  'categories',
  'keywordPresets',
  'faqEntries',
  'checklists',
  'departments',
  'notices',
  'inquiries',
  'conversations',
]

if (!confirmed) {
  console.log('[dry-run] 아래 컬렉션을 통째로 삭제할 예정입니다(하위 문서 포함):')
  collections.forEach((name) => console.log(`  - ${name}`))
  console.log('\n실제로 삭제하려면: npm run reset -- --confirm')
  process.exit(0)
}

for (const name of collections) {
  await db.recursiveDelete(db.collection(name))
  console.log(`Deleted collection: ${name}`)
}

console.log('\n모두 삭제했습니다. 기본 데이터를 다시 넣으려면: npm run seed')
