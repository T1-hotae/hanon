import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { primaryCategories } from '../constants'
import { useAcademicData } from '../context/useAcademicData'
import type { Category } from '../types/academic'
import { CategoryIcon } from './categoryIcons'
import styles from '../App.module.css'

// 한 페이지에 보여줄 카테고리 카드 수
const PAGE_SIZE = 4

// 홈 히어로 아래의 카테고리 카드 그리드.
// 카드를 누르면 먼저 '신청 전 체크리스트' 모달을 띄우고, 모달에서 AI 채팅 페이지로 이동한다.
// 카테고리가 4개를 넘으면 < > 화살표로 페이지를 넘겨 볼 수 있다.
export function TopTabs() {
  const { categories, checklists } = useAcademicData()
  const navigate = useNavigate()
  const cards = primaryCategories(categories)
  const [page, setPage] = useState(0)
  const [openCategory, setOpenCategory] = useState<Category | null>(null)

  // 모달이 열려 있을 때 Esc로 닫기
  useEffect(() => {
    if (!openCategory) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenCategory(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [openCategory])

  if (cards.length === 0) return null

  const pageCount = Math.ceil(cards.length / PAGE_SIZE)
  const hasSlider = cards.length > PAGE_SIZE
  const start = page * PAGE_SIZE
  const visibleCards = cards.slice(start, start + PAGE_SIZE)

  const goPrev = () => setPage((p) => Math.max(0, p - 1))
  const goNext = () => setPage((p) => Math.min(pageCount - 1, p + 1))

  const openChecklist = openCategory
    ? checklists.find((checklist) => checklist.category === openCategory.id)
    : undefined
  const checklistItems = openChecklist
    ? [...openChecklist.items].sort((a, b) => a.order - b.order)
    : []

  const goToChat = () => {
    if (!openCategory) return
    const categoryId = openCategory.id
    setOpenCategory(null)
    navigate(`/chat?c=${encodeURIComponent(categoryId)}`)
  }

  return (
    <>
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
              onClick={() => setOpenCategory(category)}
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

      {openCategory && (
        <div
          className={styles.modalBackdrop}
          role="dialog"
          aria-modal="true"
          aria-label={`${openCategory.label} 신청 전 체크리스트`}
          onClick={() => setOpenCategory(null)}
        >
          {/* 배경 클릭으로만 닫히도록 모달 내부 클릭은 전파를 막는다 */}
          <div
            className={`${styles.modal} ${styles.checklistModal}`}
            onClick={(event) => event.stopPropagation()}
          >
            <h2>신청 전 체크리스트</h2>
            <p className={styles.checklistModalCategory}>{openCategory.label}</p>

            {checklistItems.length > 0 ? (
              <ul className={styles.checklistList}>
                {checklistItems.map((item) => (
                  <li key={item.id} className={styles.checklistRow}>
                    <span className={styles.checklistBox} aria-hidden="true" />
                    <div>
                      <strong>{item.label}</strong>
                      <p>{item.content}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.contactHours}>
                아직 등록된 체크리스트가 없어요. AI에게 바로 물어보세요.
              </p>
            )}

            <div className={styles.modalActions}>
              <button type="button" onClick={() => setOpenCategory(null)}>
                닫기
              </button>
              <button type="button" className={styles.modalActionPrimary} onClick={goToChat}>
                AI에게 물어보기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
