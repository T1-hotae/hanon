import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { primaryCategories } from '../constants'
import { useAcademicData } from '../context/useAcademicData'
import type { Category } from '../types/academic'
import { CategoryIcon } from './categoryIcons'
import styles from '../App.module.css'

// 한 페이지에 보여줄 카테고리 카드 수
const PAGE_SIZE = 3

const CARD_CONTENT: Record<string, { label: string; description: string }> = {
  transfer: {
    label: '전과/전부전과',
    description: '전과·전부전과 신청 자격 및 절차 안내',
  },
  course: {
    label: '수강신청',
    description: '수강신청 일정 및 방법 안내',
  },
  leave: {
    label: '휴학',
    description: '휴학 신청 절차 및 제출 서류 안내',
  },
}

const CheckMark = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
    <path d="m2.6 6.9 2.6 2.6 5.2-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
  </svg>
)

const CloseMark = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="m3.5 3.5 7 7M10.5 3.5l-7 7" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
  </svg>
)

// 홈 히어로 아래의 카테고리 카드 그리드.
// 카드를 누르면 먼저 '신청 전 체크리스트' 모달을 띄우고, 모달에서 AI 채팅 페이지로 이동한다.
// 카테고리가 4개를 넘으면 < > 화살표로 페이지를 넘겨 볼 수 있다.
export function TopTabs() {
  const { categories, checklists } = useAcademicData()
  const navigate = useNavigate()
  const cards = primaryCategories(categories)
  const [page, setPage] = useState(0)
  const [openCategory, setOpenCategory] = useState<Category | null>(null)
  // 학생이 직접 눌러 체크한 항목(모달을 닫으면 초기화된다)
  const [checkedIds, setCheckedIds] = useState<string[]>([])
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const lastFocusedRef = useRef<HTMLElement | null>(null)

  // 모달이 열려 있는 동안: Esc로 닫기, 배경 스크롤 잠금, 포커스 이동/복원
  useEffect(() => {
    if (!openCategory) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenCategory(null)
    }
    const previousOverflow = document.body.style.overflow

    window.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      lastFocusedRef.current?.focus()
    }
  }, [openCategory])

  if (cards.length === 0) return null

  const pageCount = Math.ceil(cards.length / PAGE_SIZE)
  const hasSlider = cards.length > PAGE_SIZE
  const start = page * PAGE_SIZE
  const visibleCards = cards.slice(start, start + PAGE_SIZE)

  const goPrev = () => setPage((p) => Math.max(0, p - 1))
  const goNext = () => setPage((p) => Math.min(pageCount - 1, p + 1))

  const openModal = (category: Category) => {
    lastFocusedRef.current = document.activeElement as HTMLElement | null
    setCheckedIds([])
    setOpenCategory(category)
  }

  const checklist = openCategory
    ? checklists.find((item) => item.category === openCategory.id)
    : undefined
  const items = checklist ? [...checklist.items].sort((a, b) => a.order - b.order) : []
  const checkedCount = items.filter((item) => checkedIds.includes(item.id)).length
  const progress = items.length ? Math.round((checkedCount / items.length) * 100) : 0
  const allChecked = items.length > 0 && checkedCount === items.length

  const toggleItem = (id: string) =>
    setCheckedIds((prev) => (prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]))

  // 채팅은 학사 항목으로 구분하지 않으므로 카테고리 없이 채팅으로 이동한다.
  const goToChat = () => {
    setOpenCategory(null)
    navigate('/chat')
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
          {visibleCards.map((category) => {
            const content = CARD_CONTENT[category.id]

            return (
              <button
                type="button"
                key={category.id}
                className={styles.categoryCard}
                data-category={category.id}
                onClick={() => openModal(category)}
              >
                <span className={styles.categoryCardIcon} aria-hidden="true">
                  <CategoryIcon category={category} />
                </span>
                <strong>{content?.label ?? category.label}</strong>
                {(content?.description ?? category.description) && (
                  <span>{content?.description ?? category.description}</span>
                )}
              </button>
            )
          })}
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
        // 배경(백드롭) 클릭으로 닫고, 모달 내부 클릭은 전파를 막는다.
        <div
          className={`${styles.modalBackdrop} ${styles.checklistBackdrop}`}
          role="presentation"
          onClick={() => setOpenCategory(null)}
        >
          <div
            className={`${styles.modal} ${styles.checklistModal}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="checklistModalTitle"
            onClick={(event) => event.stopPropagation()}
          >
            <header className={styles.checklistModalHeader}>
              <span className={styles.checklistModalIcon} aria-hidden="true">
                <CategoryIcon category={openCategory} />
              </span>
              <div className={styles.checklistModalHeading}>
                <p className={styles.checklistModalEyebrow}>{openCategory.label}</p>
                <h2 id="checklistModalTitle">신청 전 체크리스트</h2>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                className={styles.checklistModalClose}
                onClick={() => setOpenCategory(null)}
                aria-label="닫기"
              >
                <CloseMark />
              </button>
            </header>

            {items.length > 0 && (
              <div className={styles.checklistProgress}>
                <span
                  className={styles.checklistProgressTrack}
                  role="progressbar"
                  aria-label="체크 진행률"
                  aria-valuemin={0}
                  aria-valuemax={items.length}
                  aria-valuenow={checkedCount}
                >
                  <span className={styles.checklistProgressFill} style={{ width: `${progress}%` }} />
                </span>
                <span className={styles.checklistProgressText}>
                  {allChecked ? '모두 확인 완료' : `${checkedCount}/${items.length} 확인`}
                </span>
              </div>
            )}

            <div className={styles.checklistModalBody}>
              {items.length > 0 ? (
                <ul className={styles.checklistToggleList}>
                  {items.map((item) => {
                    const checked = checkedIds.includes(item.id)
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          className={`${styles.checklistToggle} ${checked ? styles.checklistToggleChecked : ''}`}
                          onClick={() => toggleItem(item.id)}
                          aria-pressed={checked}
                        >
                          <span className={styles.checklistToggleBox} aria-hidden="true">
                            <CheckMark />
                          </span>
                          <span className={styles.checklistToggleText}>
                            <strong>{item.label}</strong>
                            <span>{item.content}</span>
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className={styles.checklistModalEmpty}>
                  아직 등록된 체크리스트가 없어요.
                  <br />
                  문무니 AI에게 바로 물어보세요.
                </p>
              )}
            </div>

            <footer className={styles.checklistModalFooter}>
              <button
                type="button"
                className={styles.checklistGhostButton}
                onClick={() => setOpenCategory(null)}
              >
                닫기
              </button>
              <button type="button" className={styles.checklistPrimaryButton} onClick={goToChat}>
                AI에게 물어보기
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  )
}
