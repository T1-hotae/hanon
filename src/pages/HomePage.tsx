import { Link } from 'react-router-dom'
import { CategoryChips } from '../components/CategoryChips'
import { Layout } from '../components/Layout'
import { NoticeList } from '../components/NoticeList'
import { useAcademicData } from '../context/useAcademicData'
import { formatViews, sortFaqs, sortNoticesByViews } from '../utils/format'
import styles from '../App.module.css'

export function HomePage() {
  const { faqEntries, notices } = useAcademicData()
  const topFaqs = sortFaqs(faqEntries).slice(0, 5)
  const popularNotices = sortNoticesByViews(notices).slice(0, 10)

  return (
    <Layout>
      <section className={styles.introBand}>
        <p className={styles.eyebrow}>자주 찾는 항목</p>
        <h1>문무니에서 학사 질문과 원문 공지를 빠르게 확인하세요.</h1>
        <CategoryChips limitToPrimary />
      </section>

      <section className={styles.section}>
        <div className={styles.sectionTitle}>
          <h2>지금 많이 묻는 질문 TOP 5</h2>
        </div>
        <div className={styles.rankList}>
          {topFaqs.map((faq, index) => (
            <Link
              key={faq.id}
              to={`/category/${faq.category}?open=${encodeURIComponent(faq.id)}`}
              className={styles.rankRow}
            >
              <span>{index + 1}</span>
              <strong>{faq.question}</strong>
              <em>{formatViews(faq.viewCount)}</em>
            </Link>
          ))}
        </div>
      </section>

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
