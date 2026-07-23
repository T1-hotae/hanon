import type { ReactNode } from 'react'
import { ChatWidget } from './ChatWidget'
import { Header } from './Header'
import { useAcademicData } from '../context/useAcademicData'
import styles from '../App.module.css'

export function Layout({ children }: { children: ReactNode }) {
  const { firebaseUnavailable } = useAcademicData()

  return (
    <>
      <Header />
      <main className={styles.shell}>
        {firebaseUnavailable && (
          <div className={styles.mockNotice}>
            Firebase 환경변수가 설정되지 않아 학사 데이터를 불러올 수 없습니다.
          </div>
        )}
        {children}
      </main>
      <ChatWidget />
    </>
  )
}
