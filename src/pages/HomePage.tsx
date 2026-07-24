import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { NoticeList } from '../components/NoticeList'
import { PopularQuestions } from '../components/PopularQuestions'
import { TopTabs } from '../components/TopTabs'
import { useAcademicData } from '../context/useAcademicData'
import { sortNoticesByViews } from '../utils/format'
import munmuniMascot from '../assets/munmuni-mascot.png'
import styles from '../App.module.css'

function Hero() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    navigate(`/chat?q=${encodeURIComponent(trimmed)}`)
    setQuery('')
  }

  return (
    <section className={styles.hero}>
      <h1 className={styles.heroTitle}>
        문의할게 <span>무니?</span>
      </h1>
      <p className={styles.heroSubtitle}>궁금한 학사정보, 문무니가 빠르고 정확하게 알려드릴게요!</p>

      <div className={styles.heroMascotWrap}>
        <img className={styles.heroMascot} src={munmuniMascot} alt="문무니 마스코트" />
        <span className={styles.heroBubble}>무엇이 궁금하신가요?</span>
      </div>

      <form className={styles.heroSearch} onSubmit={onSubmit}>
        <span className={styles.heroSearchIcon} aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="궁금한 내용을 검색해보세요"
          aria-label="궁금한 내용 검색"
        />
        <button type="submit" aria-label="검색">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="m13 5 7 7-7 7" />
          </svg>
        </button>
      </form>
    </section>
  )
}

export function HomePage() {
  const { notices } = useAcademicData()
  const popularNotices = sortNoticesByViews(notices).slice(0, 10)

  return (
    <Layout>
      <Hero />
      <TopTabs />

      <PopularQuestions />

      <section className={styles.section}>
        <div className={styles.sectionTitle}>
          <h2>자주 찾는 원문 공지</h2>
          <Link to="/notices">더보기</Link>
        </div>
        <NoticeList notices={popularNotices} />
      </section>
    </Layout>
  )
}
