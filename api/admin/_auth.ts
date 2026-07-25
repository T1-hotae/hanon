import type { VercelRequest } from '@vercel/node'
import admin from 'firebase-admin'

const projectId = process.env.FIREBASE_PROJECT_ID ?? process.env.VITE_FIREBASE_PROJECT_ID

const parseServiceAccount = () => {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
    ?? (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64
      ? Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8')
      : '')

  if (!raw) return undefined
  const parsed = JSON.parse(raw) as admin.ServiceAccount
  if (typeof parsed.privateKey === 'string') {
    parsed.privateKey = parsed.privateKey.replace(/\\n/g, '\n')
  }
  return parsed
}

const getAdminApp = () => {
  if (admin.apps.length > 0) return admin.app()

  const serviceAccount = parseServiceAccount()
  return admin.initializeApp(serviceAccount
    ? { credential: admin.credential.cert(serviceAccount), projectId }
    : { projectId })
}

export const requireAdmin = async (req: VercelRequest) => {
  const header = req.headers.authorization ?? ''
  const match = header.match(/^Bearer\s+(.+)$/i)
  if (!match) throw new Error('관리자 인증 토큰이 없습니다.')

  const app = getAdminApp()
  const decoded = await app.auth().verifyIdToken(match[1])
  if (decoded.firebase?.sign_in_provider !== 'password') {
    throw new Error('관리자 권한이 없습니다.')
  }

  return decoded
}
