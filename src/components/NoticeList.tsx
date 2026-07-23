import { incrementNoticeView } from '../services/inquiryService'
import type { Notice } from '../types/academic'
import { formatDate, formatViews, markNoticeViewedOnce } from '../utils/format'
import styles from '../App.module.css'

export function NoticeList({ notices }: { notices: Notice[] }) {
  const handleClick = (noticeId: string) => {
    if (markNoticeViewedOnce(noticeId)) void incrementNoticeView(noticeId)
  }

  if (notices.length === 0) {
    return <p className={styles.emptyState}>등록된 원문 공지가 없습니다.</p>
  }

  return (
    <ul className={styles.noticeList}>
      {notices.map((notice) => (
        <li key={notice.id}>
          <a href={notice.url} target="_blank" rel="noreferrer" onClick={() => handleClick(notice.id)}>
            {notice.title}
          </a>
          <div className={styles.noticeMeta}>
            <span>{formatViews(notice.viewCount)}</span>
            <time>{formatDate(notice.postedAt)}</time>
          </div>
        </li>
      ))}
    </ul>
  )
}
