import { Link } from 'react-router-dom'
import munmuniMascot from '../assets/munmuni-mascot.png'
import { PhoneIcon } from './PhoneIcon'
import styles from '../App.module.css'

export function Header() {
  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>
        <span className={styles.logoMascot} aria-hidden="true">
          <img src={munmuniMascot} alt="" />
        </span>
        <span className={styles.logoName}>문무니</span>
        <span className={styles.logoDivider} aria-hidden="true" />
        <span className={styles.logoSub}>AI 학사 문의 도우미</span>
      </Link>
      <Link to="/directory" className={styles.menuButton} aria-label="전화번호부 열기">
        <PhoneIcon size={29} variant="cute" />
      </Link>
    </header>
  )
}
