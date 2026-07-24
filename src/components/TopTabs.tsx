import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { primaryCategories } from '../constants'
import { useAcademicData } from '../context/useAcademicData'
import { CategoryIcon } from './categoryIcons'
import styles from '../App.module.css'

// 한 페이지에 보여줄 카테고리 카드 수
const PAGE_SIZE = 4

// 홈 히어로 아래의 카테고리 카드 그리드. 카드를 누르면 해당 카테고리로 AI 채팅 페이지로 이동한다.
// 카테고리가 4개를 넘으면 < > 화살표로 페이지를 넘겨 볼 수 있다.
export function TopTabs() {
  const { categories } = useAcademicData()
  const navigate = useNavigate()
  const cards = primaryCategories(categories)
  const [page, setPage] = useState(0)

  if (cards.length === 0) return null

  const pageCount = Math.ceil(cards.length / PAGE_SIZE)
  const hasSlider = cards.length > PAGE_SIZE
  const start = page * PAGE_SIZE
  const visibleCards = cards.slice(start, start + PAGE_SIZE)

  const goPrev = () => setPage((p) => Math.max(0, p - 1))
  const goNext = () => setPage((p) => Math.min(pageCount - 1, p + 1))

  return (
    <div className={styles.categorySlider}>
      {hasSlider && (
        <button
          type="button"
          className={styles.categoryArrow}
          onClick={goPrev}
          disabled={page === 0}
          aria-label="이전 카테고리"
        >
          &lt;
        </button>
      )}

      <nav className={styles.categoryCards} aria-label="학사 항목 바로가기">
        {visibleCards.map((category) => (
          <button
            type="button"
            key={category.id}
            className={styles.categoryCard}
            onClick={() => navigate(`/chat?c=${encodeURIComponent(category.id)}`)}
          >
            <span className={styles.categoryCardIcon} aria-hidden="true">
              <CategoryIcon category={category} />
            </span>
            <strong>{category.label}</strong>
            {category.description && <span>{category.description}</span>}
          </button>
        ))}
      </nav>

      {hasSlider && (
        <button
          type="button"
          className={styles.categoryArrow}
          onClick={goNext}
          disabled={page >= pageCount - 1}
          aria-label="다음 카테고리"
        >
          &gt;
        </button>
      )}
    </div>
  )
}
