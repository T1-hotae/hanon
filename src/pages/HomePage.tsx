import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatedMascot } from '../components/AnimatedMascot'
import { Layout } from '../components/Layout'
import { NoticeList } from '../components/NoticeList'
import { PopularQuestions } from '../components/PopularQuestions'
import { TopTabs } from '../components/TopTabs'
import { useAcademicData } from '../context/useAcademicData'
import { popularSearchKeywords } from '../constants'
import { sortNoticesByViews } from '../utils/format'
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
        <span className={`${styles.heroSparkle} ${styles.heroSparkleLeft}`} aria-hidden="true">✦</span>
        <AnimatedMascot animationEnabled />
        <span className={`${styles.heroSparkle} ${styles.heroSparkleRight}`} aria-hidden="true">✦</span>
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
          placeholder="궁금한 내용을 문무니에게 물어보세요"
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

function PopularSearches() {
  return (
    <nav className={styles.popularSearches} aria-label="많이 찾는 검색어">
      <strong className={styles.popularSearchesTitle}>
        <span aria-hidden="true">✦</span>
        많이 찾는 검색어
      </strong>
      <div className={styles.popularSearchLinks}>
        {popularSearchKeywords.map((keyword) => (
          <Link key={keyword} to={`/chat?q=${encodeURIComponent(keyword)}`}>
            # {keyword}
          </Link>
        ))}
      </div>
      <Link className={styles.popularSearchMore} to="/chat">
        더보기 <span aria-hidden="true">›</span>
      </Link>
    </nav>
  )
}

export function HomePage() {
  const { notices } = useAcademicData()
  const popularNotices = sortNoticesByViews(notices).slice(0, 10)

  return (
    <Layout home>
      <div className={styles.homePage}>
        <Hero />
        <TopTabs />
        <PopularSearches />

        <div className={styles.homeLowerContent}>
          <PopularQuestions />

          <section className={styles.section}>
            <div className={styles.sectionTitle}>
              <h2>자주 찾는 원문 공지</h2>
              <Link to="/notices">더보기</Link>
            </div>
            <NoticeList notices={popularNotices} />
          </section>
        </div>
      </div>
    </Layout>
  )
}
