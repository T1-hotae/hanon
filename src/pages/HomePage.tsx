import { Link } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { NoticeList } from '../components/NoticeList'
import { PopularQuestions } from '../components/PopularQuestions'
import { useAcademicData } from '../context/useAcademicData'
import { sortNoticesByViews } from '../utils/format'
import styles from '../App.module.css'

export function HomePage() {
  const { notices } = useAcademicData()
  const popularNotices = sortNoticesByViews(notices).slice(0, 10)

  return (
    <Layout>
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
