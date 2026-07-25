import { useState } from 'react'
import type { ConversationSummary } from '../services/chatService'
import styles from '../App.module.css'

type Props = {
  items: ConversationSummary[]
  activeId: string | null
  disabled?: boolean
  onSelect: (item: ConversationSummary) => void
  onNew: () => void
  onClear: () => void
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

// AI 채팅과 상담사 채팅은 완전히 별개의 대화다. 상단 탭으로 골라 보고,
// '전체'에서는 종류를 섞어 최근 순서(목록이 이미 시간 역순)로 그대로 나열한다.
const TABS = [
  { key: 'all', label: '전체' },
  { key: 'ai', label: 'AI 채팅' },
  { key: 'human', label: '상담사 채팅' },
] as const

type TabKey = (typeof TABS)[number]['key']

const matchesTab = (item: ConversationSummary, tab: TabKey): boolean =>
  tab === 'all' ? true : item.needsHuman === (tab === 'human')

const EMPTY_TEXT: Record<TabKey, string> = {
  all: '아직 지난 대화가 없어요. 문무니에게 무엇이든 물어보세요!',
  ai: 'AI 채팅 기록이 아직 없어요.',
  human: '상담사 채팅 기록이 아직 없어요.',
}

// 왼쪽 사이드: 지난 대화 목록(채팅 기록). 클릭하면 해당 대화로 이어서 볼 수 있다.
// '+ 새 대화'는 항상 AI 대화를 새로 시작한다(상담사 대화는 채팅 화면의 '상담사 연결'로만 열린다).
export function ChatHistoryPanel({ items, activeId, disabled, onSelect, onNew, onClear }: Props) {
  const [tab, setTab] = useState<TabKey>('all')
  // 기록 초기화는 되돌릴 수 없으므로 같은 자리에서 한 번 더 확인받는다.
  const [confirmingClear, setConfirmingClear] = useState(false)

  const visible = items.filter((item) => matchesTab(item, tab))
  const countOf = (key: TabKey) => items.filter((item) => matchesTab(item, key)).length

  const clear = () => {
    setConfirmingClear(false)
    onClear()
  }

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

      <div className={styles.chatHistoryTabs} role="group" aria-label="채팅 기록 종류">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`${styles.chatHistoryTab} ${
              tab === item.key ? styles.chatHistoryTabActive : ''
            }`}
            onClick={() => setTab(item.key)}
            aria-pressed={tab === item.key}
          >
            {item.label}
            <span>{countOf(item.key)}</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className={styles.chatHistoryEmpty}>
          {disabled ? '데모 모드에서는 대화가 저장되지 않습니다.' : EMPTY_TEXT[tab]}
        </p>
      ) : (
        <div className={styles.chatHistoryScroll}>
          <ul className={styles.chatHistoryList}>
            {visible.map((item) => {
              // 제목은 첫 질문이다. 제목이 아직 없는 옛 대화는 마지막 메시지를 제목 자리에 쓴다.
              const title = item.title || item.lastMessage
              const preview = item.lastMessage === title ? null : item.lastMessage
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`${styles.chatHistoryItem} ${
                      item.needsHuman ? styles.chatHistoryItemHuman : ''
                    } ${item.id === activeId ? styles.chatHistoryItemActive : ''}`}
                    onClick={() => onSelect(item)}
                    aria-current={item.id === activeId ? 'true' : undefined}
                  >
                    <span className={styles.chatHistoryItemTop}>
                      {/* '전체'에서는 종류가 섞이므로 항목마다 배지로 알려준다. */}
                      {tab === 'all' && (
                        <span className={styles.chatHistoryKind}>
                          {item.needsHuman ? '상담사' : 'AI'}
                        </span>
                      )}
                      <span className={styles.chatHistoryTitle}>{title}</span>
                      <span className={styles.chatHistoryWhen}>
                        {formatWhen(item.lastMessageAt)}
                      </span>
                    </span>
                    {preview && <span className={styles.chatHistoryPreview}>{preview}</span>}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {items.length > 0 && !disabled && (
        <div className={styles.chatHistoryFoot}>
          {confirmingClear ? (
            <>
              <span className={styles.chatHistoryFootAsk}>기록을 모두 지울까요?</span>
              <button type="button" onClick={() => setConfirmingClear(false)}>
                취소
              </button>
              <button type="button" className={styles.chatHistoryClearYes} onClick={clear}>
                지우기
              </button>
            </>
          ) : (
            <button
              type="button"
              className={styles.chatHistoryClear}
              onClick={() => setConfirmingClear(true)}
            >
              기록 초기화
            </button>
          )}
        </div>
      )}
    </aside>
  )
}
