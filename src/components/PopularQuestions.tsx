import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { primaryCategories } from '../constants'
import { useAcademicData } from '../context/useAcademicData'
import type { CategoryId } from '../types/academic'
import { sortFaqs } from '../utils/format'
import styles from '../App.module.css'

const PAGE_SIZE = 5

// 홈 '지금 많이 묻는 질문' 섹션.
// 교직원이 admin에서 showOnHome을 켠 FAQ만 노출하며, 카테고리 필터 + 페이지네이션을 제공한다.
export function PopularQuestions() {
  const { categories, faqEntries } = useAcademicData()
  const [filter, setFilter] = useState<CategoryId | 'all'>('all')
  const [page, setPage] = useState(1)

  const tabs = primaryCategories(categories)

  const questions = useMemo(
    () =>
      sortFaqs(
        faqEntries.filter(
          (faq) => faq.showOnHome && (filter === 'all' || faq.category === filter),
        ),
      ),
    [faqEntries, filter],
  )

  const totalPages = Math.max(1, Math.ceil(questions.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = questions.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const changeFilter = (next: CategoryId | 'all') => {
    setFilter(next)
    setPage(1)
  }

  const categoryLabel = (id: CategoryId) =>
    categories.find((category) => category.id === id)?.label ?? id

  return (
    <section className={styles.section}>
      <div className={styles.sectionTitle}>
        <h2>지금 많이 묻는 질문</h2>
      </div>

      <div className={styles.tabs} role="tablist" aria-label="카테고리 필터">
        <button
          type="button"
          className={filter === 'all' ? styles.activeTab : undefined}
          onClick={() => changeFilter('all')}
        >
          전체
        </button>
        {tabs.map((category) => (
          <button
            type="button"
            key={category.id}
            className={filter === category.id ? styles.activeTab : undefined}
            onClick={() => changeFilter(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>

      {pageItems.length === 0 ? (
        <p className={styles.emptyState}>아직 등록된 질문이 없습니다.</p>
      ) : (
        <div className={styles.rankList}>
          {pageItems.map((faq) => (
            <Link
              key={faq.id}
              to={`/category/${faq.category}?open=${encodeURIComponent(faq.id)}`}
              className={styles.questionRow}
            >
              <span className={styles.questionBadge}>{categoryLabel(faq.category)}</span>
              <strong>{faq.question}</strong>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            type="button"
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            disabled={currentPage === 1}
          >
            이전
          </button>
          <span>
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            disabled={currentPage === totalPages}
          >
            다음
          </button>
        </div>
      )}
    </section>
  )
}
