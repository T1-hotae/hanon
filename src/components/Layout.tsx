import type { ReactNode } from 'react'
import { ChatWidget } from './ChatWidget'
import { Header } from './Header'
import { useAcademicData } from '../context/useAcademicData'
import styles from '../App.module.css'

export function Layout({ children }: { children: ReactNode }) {
  const { usingMockData } = useAcademicData()

  return (
    <>
      <Header />
      <main className={styles.shell}>
        {usingMockData && (
          <div className={styles.mockNotice}>
            Firebase 환경변수가 없거나 Firestore 조회에 실패해 기본 데이터로 실행 중입니다.
          </div>
        )}
        {children}
      </main>
      <ChatWidget />
    </>
  )
}
