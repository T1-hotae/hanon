import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useAcademicData } from '../context/useAcademicData'
import {
  createConversation,
  markConversationReadByStudent,
  sendStudentMessage,
  subscribeMessages,
} from '../services/chatService'
import { createChatInquiry } from '../services/inquiryService'
import type { CategoryId, ChatMessage } from '../types/academic'
import styles from '../App.module.css'

const STORAGE_KEY = 'hannon-chat-session'
const LOCAL = 'local'

type StoredSession = { conversationId: string; category: CategoryId }

const loadSession = (): StoredSession | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as StoredSession) : null
  } catch {
    return null
  }
}

const saveSession = (session: StoredSession | null) => {
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // localStorage 접근 불가 시 무시
  }
}

const uid = () => Math.random().toString(36).slice(2, 10)

export function ChatWidget() {
  const { categories, faqEntries, keywordPresets } = useAcademicData()
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState<CategoryId | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [customText, setCustomText] = useState('')
  const [starting, setStarting] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)

  const localMode = conversationId === LOCAL

  // 저장된 세션 복구
  useEffect(() => {
    const session = loadSession()
    if (session) {
      setCategory(session.category)
      setConversationId(session.conversationId)
    }
  }, [])

  // 메시지 실시간 구독 (로컬 모드는 제외)
  useEffect(() => {
    if (!conversationId || conversationId === LOCAL) return
    const unsubscribe = subscribeMessages(conversationId, setMessages)
    return unsubscribe
  }, [conversationId])

  // 열려 있을 때 스크롤 하단 고정 + 읽음 처리
  useEffect(() => {
    if (!open) return
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight })
    if (conversationId && conversationId !== LOCAL) void markConversationReadByStudent(conversationId)
  }, [messages, open, conversationId])

  const selectCategory = async (id: CategoryId) => {
    if (starting) return
    setStarting(true)
    setCategory(id)
    const convId = await createConversation(id)
    const nextId = convId ?? LOCAL
    setConversationId(nextId)
    setMessages([])
    if (convId) saveSession({ conversationId: convId, category: id })
    setStarting(false)
  }

  const pushLocal = (from: ChatMessage['from'], text: string) => {
    setMessages((current) => [...current, { id: uid(), from, text, createdAt: Date.now() }])
  }

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || !category || !conversationId) return
    setCustomText('')

    const faq = faqEntries.find((item) => item.category === category && item.question === trimmed)

    if (localMode) {
      pushLocal('student', trimmed)
      if (faq) pushLocal('bot', faq.answer)
      else pushLocal('bot', '문의가 접수되었습니다. 담당자가 확인 후 답변드립니다.')
      return
    }

    await sendStudentMessage(conversationId, 'student', trimmed)
    // 문의 로그(빈도 대시보드용)
    void createChatInquiry(category, trimmed, undefined, conversationId)
    // 매칭되는 FAQ가 있으면 봇 자동응답을 함께 남긴다.
    if (faq) await sendStudentMessage(conversationId, 'bot', faq.answer)
  }

  const reset = () => {
    saveSession(null)
    setConversationId(null)
    setCategory(null)
    setMessages([])
    setCustomText('')
  }

  const onCustomSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void send(customText)
  }

  const categoryQuestions = category
    ? keywordPresets.filter((question) => question.category === category)
    : []
  const activeCategory = categories.find((item) => item.id === category)
  const started = Boolean(conversationId)

  return (
    <div className={styles.chatWidget}>
      {open && (
        <div className={styles.chatPanel} role="dialog" aria-label="채팅 문의">
          <div className={styles.chatHeader}>
            <strong>{activeCategory ? `${activeCategory.label} 상담` : '채팅 문의'}</strong>
            <button type="button" onClick={() => setOpen(false)} aria-label="닫기">
              ×
            </button>
          </div>
          <div className={styles.chatBody} ref={bodyRef}>
            {!started && (
              <div className={styles.chatBubbleBot}>
                <p>안녕하세요. 어떤 항목이 궁금하신가요?</p>
              </div>
            )}
            {started && messages.length === 0 && (
              <div className={styles.chatBubbleBot}>
                <p>
                  {activeCategory?.label} 관련 궁금한 점을 선택하거나 직접 입력해 주세요. 담당자가
                  확인 후 답변드립니다.
                </p>
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={message.from === 'student' ? styles.chatBubbleUser : styles.chatBubbleBot}
              >
                <p>{message.text}</p>
              </div>
            ))}
          </div>
          <div className={styles.chatOptions}>
            {!started && (
              <div className={styles.chatQuickGrid}>
                {categories.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    disabled={starting}
                    onClick={() => void selectCategory(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
            {started && (
              <>
                <div className={styles.chatQuickGrid}>
                  {categoryQuestions.map((question) => (
                    <button type="button" key={question.id} onClick={() => void send(question.text)}>
                      {question.text}
                    </button>
                  ))}
                  <button type="button" onClick={reset}>
                    다른 항목 선택
                  </button>
                </div>
                <form className={styles.chatCustomForm} onSubmit={onCustomSubmit}>
                  <input
                    value={customText}
                    onChange={(event) => setCustomText(event.target.value)}
                    placeholder="궁금한 내용을 입력해 주세요"
                    aria-label="문의 내용"
                  />
                  <button type="submit">보내기</button>
                </form>
              </>
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
