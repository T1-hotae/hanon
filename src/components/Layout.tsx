import type { ReactNode } from 'react'
import { Header } from './Header'
import { useAcademicData } from '../context/useAcademicData'
import styles from '../App.module.css'

export function Layout({
  children,
  fullHeight = false,
  home = false,
}: {
  children: ReactNode
  fullHeight?: boolean
  home?: boolean
}) {
  const { firebaseUnavailable } = useAcademicData()

  return (
    <>
      <Header />
      <main
        className={`${styles.shell} ${fullHeight ? styles.shellFull : ''} ${home ? styles.shellHome : ''}`}
        {...(fullHeight ? { 'data-full-height': '' } : {})}
      >
        {firebaseUnavailable && (
          <div className={styles.mockNotice}>
            Firebase 환경변수가 설정되지 않아 학사 데이터를 불러올 수 없습니다.
          </div>
        )}
        {children}
      </main>
    </>
  )
}
