import { Link } from 'react-router-dom'
import styles from '../App.module.css'

export function Header() {
  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>
        <span className={styles.logoName}>문무니</span>
        <span className={styles.logoSub}>AI 학사 문의 도우미</span>
      </Link>
      <Link to="/directory" className={styles.noticeButton}>
        전화번호부
      </Link>
    </header>
  )
}
