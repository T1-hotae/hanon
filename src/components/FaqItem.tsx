import { useAcademicData } from '../context/useAcademicData'
import { incrementFaqView } from '../services/inquiryService'
import type { FaqEntry } from '../types/academic'
import { formatViews, markFaqViewedOnce } from '../utils/format'
import styles from '../App.module.css'

export function FaqItem({
  faq,
  open,
  onToggle,
}: {
  faq: FaqEntry
  open: boolean
  onToggle: () => void
}) {
  const { notices } = useAcademicData()
  const related = notices.filter((notice) => faq.relatedNoticeIds.includes(notice.id))

  const handleToggle = () => {
    // 닫힘 → 열림 시 세션당 1회 조회수 증가
    if (!open && markFaqViewedOnce(faq.id)) void incrementFaqView(faq.id)
    onToggle()
  }

  return (
    <div className={styles.faqItem}>
      <button type="button" onClick={handleToggle} aria-expanded={open}>
        <span>Q. {faq.question}</span>
        <em>{formatViews(faq.viewCount)}</em>
      </button>
      {open && (
        <div className={styles.faqBody}>
          <p>{faq.answer}</p>
          {faq.answerImageUrls.length > 0 && (
            <div className={styles.answerImages}>
              {faq.answerImageUrls.map((url) => (
                <img key={url} src={url} alt="" loading="lazy" />
              ))}
            </div>
          )}
          {related.length > 0 && (
            <>
              <strong>관련 원문 공지</strong>
              <ul>
                {related.map((notice) => (
                  <li key={notice.id}>
                    <a href={notice.url} target="_blank" rel="noreferrer">
                      {notice.title}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  )
}
