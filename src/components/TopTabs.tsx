import { Link, useLocation } from 'react-router-dom'
import { primaryCategories } from '../constants'
import { useAcademicData } from '../context/useAcademicData'
import styles from '../App.module.css'

// 사이트 전반에서 쓰는 주요 학사 항목 탭바. 현재 카테고리 경로일 때 해당 탭을 활성화한다.
export function TopTabs() {
  const { categories } = useAcademicData()
  const { pathname } = useLocation()
  const tabs = primaryCategories(categories)
  const activeId = pathname.startsWith('/category/') ? pathname.split('/')[2] : undefined

  if (tabs.length === 0) return null

  return (
    <nav className={styles.topTabs} aria-label="주요 학사 항목">
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          to={`/category/${tab.id}`}
          aria-current={tab.id === activeId ? 'page' : undefined}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  )
}
