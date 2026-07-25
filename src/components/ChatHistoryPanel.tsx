import type { ConversationSummary } from '../services/chatService'
import styles from '../App.module.css'

type Props = {
  items: ConversationSummary[]
  activeId: string | null
  disabled?: boolean
  onSelect: (item: ConversationSummary) => void
  onNew: () => void
}

// 방금/N분 전/N시간 전/M.DD 형태로 간결하게 표기한다.
const formatWhen = (timestamp: number): string => {
  const diff = Date.now() - timestamp
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour
  if (diff < minute) return '방금'
  if (diff < hour) return `${Math.floor(diff / minute)}분 전`
  if (diff < day) return `${Math.floor(diff / hour)}시간 전`
  const date = new Date(timestamp)
  return `${date.getMonth() + 1}.${String(date.getDate()).padStart(2, '0')}`
}

// 왼쪽 사이드: 지난 대화 목록(채팅 기록). 클릭하면 해당 대화로 이어서 볼 수 있다.
// 학사 항목으로 구분하지 않으므로 항목 라벨 대신 상담 종류(AI/상담사)만 보여준다.
export function ChatHistoryPanel({ items, activeId, disabled, onSelect, onNew }: Props) {
  return (
    <aside className={styles.chatHistoryPanel} aria-label="채팅 기록">
      <div className={styles.chatHistoryHead}>
        <h3>
          채팅 기록
          {items.length > 0 && <span className={styles.chatHistoryCount}>{items.length}</span>}
        </h3>
        <button type="button" className={styles.chatHistoryNew} onClick={onNew} disabled={disabled}>
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
          새 대화
        </button>
      </div>

      {items.length === 0 ? (
        <p className={styles.chatHistoryEmpty}>
          {disabled
            ? '데모 모드에서는 대화가 저장되지 않습니다.'
            : '아직 지난 대화가 없어요. 문무니에게 무엇이든 물어보세요!'}
        </p>
      ) : (
        <ul className={styles.chatHistoryList}>
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={`${styles.chatHistoryItem} ${item.id === activeId ? styles.chatHistoryItemActive : ''}`}
                onClick={() => onSelect(item)}
                aria-current={item.id === activeId ? 'true' : undefined}
              >
                <span className={styles.chatHistoryItemTop}>
                  <span
                    className={`${styles.chatHistoryCategory} ${
                      item.needsHuman ? styles.chatHistoryCategoryHuman : ''
                    }`}
                  >
                    {item.needsHuman ? '상담사 상담' : 'AI 상담'}
                  </span>
                  <span className={styles.chatHistoryWhen}>{formatWhen(item.lastMessageAt)}</span>
                </span>
                <span className={styles.chatHistoryPreview}>{item.lastMessage}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}
