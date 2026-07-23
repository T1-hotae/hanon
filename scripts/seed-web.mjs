// 웹(client) SDK로 seed 한다. Google ADC 없이 .env + 관리자 로그인만으로 동작한다.
// 사용법:
//   ADMIN_PASSWORD=<관리자비밀번호> npm run seed:web
//   npm run seed:web -- <관리자비밀번호>            (비밀번호를 인자로 전달)
//   npm run seed:web -- <관리자비밀번호> --reset     (기존 데이터 삭제 후 다시 채우기)
import { createInterface } from 'node:readline'
import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { readEnv } from './read-env.mjs'
import { categories, checklists, notices, faqEntries, contacts } from './seed-data.mjs'

const env = readEnv()

const args = process.argv.slice(2)
const reset = args.includes('--reset')
const email = env.VITE_ADMIN_LOGIN_EMAIL ?? 'admin@han-non-e.internal'

// 입력을 화면에 표시하지 않고 비밀번호를 입력받는다(터미널에서만).
const promptHidden = (label) =>
  new Promise((resolve) => {
    process.stdout.write(label)
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true })
    rl._writeToOutput = () => {}
    rl.question('', (answer) => {
      rl.close()
      process.stdout.write('\n')
      resolve(answer.trim())
    })
  })

// 비밀번호 우선순위: CLI 인자 → ADMIN_PASSWORD(.env/셸) → 대화형 입력
let password = args.find((arg) => !arg.startsWith('--')) ?? env.ADMIN_PASSWORD
if (!password && process.stdin.isTTY) {
  password = await promptHidden(`관리자(${email}) 비밀번호: `)
}

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
}

if (!Object.values(firebaseConfig).every(Boolean)) {
  console.error('.env의 VITE_FIREBASE_* 값이 비어 있습니다. 학생 웹 .env를 먼저 채우세요.')
  process.exit(1)
}
if (!password) {
  console.error('관리자 비밀번호가 필요합니다.  예)  ADMIN_PASSWORD=xxxx npm run seed:web')
  process.exit(1)
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

console.log(`관리자(${email})로 로그인 중…`)
try {
  await signInWithEmailAndPassword(auth, email, password)
} catch (error) {
  console.error('로그인 실패: 관리자 이메일/비밀번호를 확인하세요.', error?.code ?? error)
  process.exit(1)
}

// 한 컬렉션에서 실패해도(예: 규칙 미배포) 전체 실행이 중단되지 않도록 컬렉션 단위로 예외를 처리한다.
const failures = []

const clearCollection = async (name) => {
  try {
    const snapshot = await getDocs(collection(db, name))
    await Promise.all(snapshot.docs.map((docSnap) => deleteDoc(doc(db, name, docSnap.id))))
    console.log(`Cleared ${name}: ${snapshot.size}`)
  } catch (error) {
    failures.push(`clear ${name}: ${error?.code ?? error}`)
    console.warn(`⚠ Cleared ${name} 실패: ${error?.code ?? error}`)
  }
}

const upsertAll = async (name, rows) => {
  try {
    await Promise.all(
      rows.map((row) => {
        const { id, ...data } = row
        return setDoc(
          doc(db, name, id),
          { ...data, id, updatedAt: serverTimestamp() },
          { merge: true },
        )
      }),
    )
    console.log(`Seeded ${name}: ${rows.length}`)
  } catch (error) {
    failures.push(`seed ${name}: ${error?.code ?? error}`)
    console.warn(`⚠ Seeded ${name} 실패: ${error?.code ?? error}`)
  }
}

if (reset) {
  console.log('기존 데이터 삭제 중(--reset)…')
  // 옛 keywordPresets 포함, 관리 대상 컬렉션을 비운다. (inquiries·conversations는 건드리지 않음)
  for (const name of ['keywordPresets', 'categories', 'checklists', 'notices', 'faqEntries', 'contacts']) {
    await clearCollection(name)
  }
}

await upsertAll('categories', categories)
await upsertAll('checklists', checklists)
await upsertAll('notices', notices)
await upsertAll('faqEntries', faqEntries)
await upsertAll('contacts', contacts)

if (failures.length > 0) {
  console.warn('\n일부 작업이 실패했습니다:')
  failures.forEach((message) => console.warn(` - ${message}`))
  console.warn('permission-denied면 Firestore 규칙 배포가 필요합니다: firebase deploy --only firestore:rules')
}

console.log('완료되었습니다. 학생 웹을 새로고침해 확인하세요.')
process.exit(0)
