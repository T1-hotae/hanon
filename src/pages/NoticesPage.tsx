import { useState } from 'react'
import { Layout } from '../components/Layout'
import { NoticeList } from '../components/NoticeList'
import { useAcademicData } from '../context/useAcademicData'
import type { CategoryId } from '../types/academic'
import styles from '../App.module.css'

export function NoticesPage() {
  const { categories, notices } = useAcademicData()
  const [filter, setFilter] = useState<CategoryId | 'all'>('all')
  const filtered = notices
    .filter((notice) => filter === 'all' || notice.category === filter)
    .sort((a, b) => b.postedAt - a.postedAt)

  return (
    <Layout>
      <section className={styles.section}>
        <div className={styles.sectionTitle}>
          <h1>자주 찾는 원문 공지</h1>
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value as CategoryId | 'all')}
            aria-label="카테고리 필터"
          >
            <option value="all">전체</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
        <NoticeList notices={filtered} />
      </section>
    </Layout>
  )
}
