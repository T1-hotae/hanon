import { incrementNoticeView } from '../services/inquiryService'
import type { Notice } from '../types/academic'
import { formatDate, formatViews, markNoticeViewedOnce } from '../utils/format'
import styles from '../App.module.css'

export function NoticeList({ notices }: { notices: Notice[] }) {
  const handleClick = (noticeId: string) => {
    if (markNoticeViewedOnce(noticeId)) void incrementNoticeView(noticeId)
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
