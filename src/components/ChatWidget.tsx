import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useAcademicData } from '../context/useAcademicData'
import { presetQuestions } from '../mock/presetQuestions'
import { groupInquiries } from '../services/analytics'
import { CATEGORIES, type CategoryId } from '../types/academic'
import styles from '../App.module.css'

type BotMessage = {
  id: string
  from: 'bot'
  text: string
  notices?: { id: string; title: string; url: string }[]
}
type UserMessage = { id: string; from: 'user'; text: string }
type Message = BotMessage | UserMessage

const uid = () => Math.random().toString(36).slice(2, 10)

const initialMessage: Message = {
  id: uid(),
  from: 'bot',
  text: '안녕하세요! 어떤 항목이 궁금하신가요?',
}

export function ChatWidget() {
  const { inquiries, notices, addChatInquiry } = useAcademicData()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([initialMessage])
  const [category, setCategory] = useState<CategoryId | null>(null)
  const [customMode, setCustomMode] = useState(false)
  const [customText, setCustomText] = useState('')
  const bodyRef = useRef<HTMLDivElement>(null)

  const groups = useMemo(() => groupInquiries(inquiries, 'all'), [inquiries])

  useEffect(() => {
    if (!open) return
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight })
  }, [messages, open])

  const pushBot = (text: string, noticeIds?: string[]) => {
    const related = noticeIds?.length
      ? notices.filter((notice) => noticeIds.includes(notice.id))
      : undefined
    setMessages((current) => [...current, { id: uid(), from: 'bot', text, notices: related }])
  }

  const pushUser = (text: string) => {
    setMessages((current) => [...current, { id: uid(), from: 'user', text }])
  }

  const selectCategory = (id: CategoryId) => {
    const found = CATEGORIES.find((item) => item.id === id)
    if (!found) return
    setCategory(id)
    setCustomMode(false)
    pushUser(found.label)
    pushBot(`${found.label} 관련 자주 묻는 질문이에요. 궁금하신 항목을 선택하거나 직접 입력해 주세요.`)
  }

  const ask = (questionText: string) => {
    if (!category) return
    pushUser(questionText)
    const group = groups.find(
      (item) => item.category === category && item.questionText === questionText,
    )
    if (group?.answerText) {
      addChatInquiry(category, questionText, {
        answerText: group.answerText,
        relatedNoticeIds: group.relatedNoticeIds,
      })
      pushBot(group.answerText, group.relatedNoticeIds)
    } else {
      addChatInquiry(category, questionText)
      pushBot('문의가 접수되었습니다. 담당자 확인 후 답변드릴게요.')
    }
    setCustomMode(false)
    setCustomText('')
  }

  const reset = () => {
    setCategory(null)
    setCustomMode(false)
    setCustomText('')
    pushBot('다른 궁금한 점이 있으신가요? 항목을 선택해 주세요.')
  }

  const onCustomSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = customText.trim()
    if (trimmed) ask(trimmed)
  }

  const categoryQuestions = category
    ? presetQuestions.filter((question) => question.category === category)
    : []

  return (
    <div className={styles.chatWidget}>
      {open && (
        <div className={styles.chatPanel} role="dialog" aria-label="채팅 문의">
          <div className={styles.chatHeader}>
            <strong>채팅 문의</strong>
            <button type="button" onClick={() => setOpen(false)} aria-label="닫기">
              ×
            </button>
          </div>
          <div className={styles.chatBody} ref={bodyRef}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={message.from === 'bot' ? styles.chatBubbleBot : styles.chatBubbleUser}
              >
                <p>{message.text}</p>
                {message.from === 'bot' && message.notices?.length ? (
                  <ul>
                    {message.notices.map((notice) => (
                      <li key={notice.id}>
                        <a href={notice.url} target="_blank" rel="noreferrer">
                          {notice.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
          <div className={styles.chatOptions}>
            {!category && (
              <div className={styles.chatQuickGrid}>
                {CATEGORIES.map((item) => (
                  <button type="button" key={item.id} onClick={() => selectCategory(item.id)}>
                    {item.label}
                  </button>
                ))}
              </div>
            )}
            {category && !customMode && (
              <div className={styles.chatQuickGrid}>
                {categoryQuestions.map((question) => (
                  <button type="button" key={question.id} onClick={() => ask(question.text)}>
                    {question.text}
                  </button>
                ))}
                <button type="button" onClick={() => setCustomMode(true)}>
                  목록에 없는 문의 직접 입력
                </button>
                <button type="button" onClick={reset}>
                  다른 항목 선택
                </button>
              </div>
            )}
            {category && customMode && (
              <form className={styles.chatCustomForm} onSubmit={onCustomSubmit}>
                <input
                  value={customText}
                  onChange={(event) => setCustomText(event.target.value)}
                  placeholder="궁금하신 내용을 입력해 주세요"
                  aria-label="문의 내용"
                />
                <button type="submit">보내기</button>
              </form>
            )}
          </div>
        </div>
      )}
      <button
        type="button"
        className={styles.chatToggle}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? '닫기' : '채팅 문의'}
      </button>
    </div>
  )
}
