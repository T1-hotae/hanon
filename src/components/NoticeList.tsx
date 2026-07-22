import type { Notice } from '../types/academic'
import { formatDate, formatViews, getViewCount } from '../utils/format'
import styles from '../App.module.css'

export function NoticeList({ notices }: { notices: Notice[] }) {
  return (
    <ul className={styles.noticeList}>
      {notices.map((notice) => (
        <li key={notice.id}>
          <a href={notice.url} target="_blank" rel="noreferrer">
            {notice.title}
          </a>
          <div className={styles.noticeMeta}>
            <span>{formatViews(getViewCount(notice.id))}</span>
            <time>{formatDate(notice.postedAt)}</time>
          </div>
        </li>
      ))}
    </ul>
  )
}
