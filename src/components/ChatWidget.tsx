import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useAcademicData } from '../context/useAcademicData'
import {
  askAi,
  createConversation,
  escalateToHuman,
  markConversationReadByStudent,
  sendStudentMessage,
  subscribeMessages,
  type AiChatPayload,
} from '../services/chatService'
import { createChatInquiry } from '../services/inquiryService'
import { getCategory, type CategoryId, type ChatMessage } from '../types/academic'
import styles from '../App.module.css'

const STORAGE_KEY = 'hannon-chat-session'
const LOCAL = 'local'

type ChatMode = 'ai' | 'human'

type StoredSession = { conversationId: string; category: CategoryId; mode: ChatMode }

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
  const { categories, checklists, faqEntries, keywordPresets, notices } = useAcademicData()
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState<CategoryId | null>(null)
  const [mode, setMode] = useState<ChatMode | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [customText, setCustomText] = useState('')
  const [starting, setStarting] = useState(false)
  const [aiThinking, setAiThinking] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)

  const localMode = conversationId === LOCAL

  // 저장된 세션 복구
  useEffect(() => {
    const session = loadSession()
    if (session) {
      setCategory(session.category)
      setMode(session.mode)
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

  const pushLocal = (from: ChatMessage['from'], text: string) => {
    setMessages((current) => [...current, { id: uid(), from, text, createdAt: Date.now() }])
  }

  // 카테고리 선택 → 다음 단계(상담 방식 선택)로 이동. 아직 대화는 만들지 않는다.
  const selectCategory = (id: CategoryId) => {
    if (starting) return
    setCategory(id)
    setMode(null)
    setConversationId(null)
    setMessages([])
  }

  // 상담 방식(AI / 상담사) 선택 → 대화 생성 후 채팅 시작.
  const selectMode = async (nextMode: ChatMode) => {
    if (!category || starting) return
    setStarting(true)
    setMode(nextMode)
    const convId = await createConversation(category)
    const nextId = convId ?? LOCAL
    setConversationId(nextId)
    setMessages([])
    if (convId) {
      saveSession({ conversationId: convId, category, mode: nextMode })
      if (nextMode === 'human') {
        await sendStudentMessage(convId, 'bot', '상담사에게 연결했어요. 확인 후 순차적으로 답변드립니다.')
        await escalateToHuman(convId)
      }
    } else if (nextMode === 'human') {
      pushLocal('bot', '데모 모드에서는 상담사 연결이 지원되지 않습니다. AI 상담을 이용해 주세요.')
    }
    setStarting(false)
  }

  // 현재 카테고리 지식 기반을 프록시로 보낼 형태로 만든다.
  const buildKb = (cat: CategoryId): AiChatPayload['kb'] => {
    const info = categories.find((item) => item.id === cat) ?? getCategory(cat, categories)
    const checklist = checklists.find((item) => item.category === cat)
    return {
      faqs: faqEntries
        .filter((item) => item.category === cat)
        .map((item) => ({ id: item.id, question: item.question, answer: item.answer })),
      notices: notices
        .filter((item) => item.category === cat)
        .map((item) => ({ id: item.id, title: item.title })),
      checklist: checklist ? checklist.items.map((item) => ({ label: item.label, content: item.content })) : [],
      phone: info?.phone,
      hours: info?.hours,
    }
  }

  const buildHistory = (priorMessages: ChatMessage[], latest: string): AiChatPayload['history'] => [
    ...priorMessages.map((message) => ({
      role: message.from === 'student' ? ('user' as const) : ('assistant' as const),
      content: message.text,
    })),
    { role: 'user' as const, content: latest },
  ]

  // AI 상담: 학생 메시지 → AI 답변.
  const sendToAi = async (trimmed: string) => {
    if (!category || !conversationId) return
    const categoryLabel = (categories.find((item) => item.id === category) ?? getCategory(category, categories)).label
    const payload: AiChatPayload = {
      categoryLabel,
      kb: buildKb(category),
      history: buildHistory(messages, trimmed),
    }

    if (localMode) {
      pushLocal('student', trimmed)
      setAiThinking(true)
      try {
        const result = await askAi(payload)
        pushLocal('ai', result.answer)
      } catch {
        pushLocal('ai', '지금은 답변을 불러오지 못했어요. 잠시 후 다시 시도하거나 상담사 연결을 이용해 주세요.')
      } finally {
        setAiThinking(false)
      }
      return
    }

    await sendStudentMessage(conversationId, 'student', trimmed)
    void createChatInquiry(category, trimmed, undefined, conversationId)

    setAiThinking(true)
    try {
      const result = await askAi(payload)
      await sendStudentMessage(conversationId, 'ai', result.answer)
      if (!result.confident) {
        await sendStudentMessage(
          conversationId,
          'bot',
          '더 정확한 안내가 필요하시면 아래 "상담사 연결"을 눌러 주세요.',
        )
      }
    } catch {
      await sendStudentMessage(
        conversationId,
        'ai',
        '지금은 답변을 불러오지 못했어요. "상담사 연결"을 이용해 주세요.',
      )
    } finally {
      setAiThinking(false)
    }
  }

  // 상담사 상담: 학생 메시지만 전송. 답변은 관리자가 직접 작성한다.
  const sendToHuman = async (trimmed: string) => {
    if (!category || !conversationId) return
    if (localMode) {
      pushLocal('student', trimmed)
      pushLocal('bot', '데모 모드에서는 상담사 답변이 지원되지 않습니다.')
      return
    }
    await sendStudentMessage(conversationId, 'student', trimmed)
    void createChatInquiry(category, trimmed, undefined, conversationId)
  }

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || !category || !conversationId || !mode || aiThinking) return
    setCustomText('')
    if (mode === 'ai') await sendToAi(trimmed)
    else await sendToHuman(trimmed)
  }

  // AI 상담 중 상담사로 전환.
  const switchToHuman = async () => {
    if (!conversationId) return
    setMode('human')
    if (category) saveSession({ conversationId, category, mode: 'human' })
    if (localMode) {
      pushLocal('bot', '데모 모드에서는 상담사 연결이 지원되지 않습니다.')
      return
    }
    await sendStudentMessage(conversationId, 'bot', '상담사에게 연결했어요. 확인 후 순차적으로 답변드립니다.')
    await escalateToHuman(conversationId)
  }

  const reset = () => {
    saveSession(null)
    setConversationId(null)
    setCategory(null)
    setMode(null)
    setMessages([])
    setCustomText('')
  }

  const backToModeSelect = () => {
    setMode(null)
    setConversationId(null)
    setMessages([])
    setCustomText('')
    saveSession(null)
  }

  const onCustomSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void send(customText)
  }

  const categoryQuestions = category
    ? keywordPresets.filter((question) => question.category === category)
    : []
  const activeCategory = categories.find((item) => item.id === category)
  const started = Boolean(conversationId && mode)

  const headerLabel = () => {
    if (!activeCategory) return '채팅 문의'
    if (mode === 'ai') return `${activeCategory.label} · AI 상담`
    if (mode === 'human') return `${activeCategory.label} · 상담사 상담`
    return `${activeCategory.label} 상담`
  }

  return (
    <div className={styles.chatWidget}>
      {open && (
        <div className={styles.chatPanel} role="dialog" aria-label="채팅 문의">
          <div className={styles.chatHeader}>
            <strong>{headerLabel()}</strong>
            <button type="button" onClick={() => setOpen(false)} aria-label="닫기">
              ×
            </button>
          </div>
          <div className={styles.chatBody} ref={bodyRef}>
            {!category && (
              <div className={styles.chatBubbleBot}>
                <p>안녕하세요. 어떤 항목이 궁금하신가요?</p>
              </div>
            )}
            {category && !started && (
              <div className={styles.chatBubbleBot}>
                <p>
                  {activeCategory?.label} 상담을 어떤 방식으로 진행할까요? AI 상담은 즉시 답변을
                  받을 수 있고, 상담사 상담은 담당자가 직접 확인 후 답변드립니다.
                </p>
              </div>
            )}
            {started && messages.length === 0 && mode === 'ai' && (
              <div className={styles.chatBubbleBot}>
                <p>
                  {activeCategory?.label} 관련 궁금한 점을 선택하거나 직접 입력해 주세요. AI가 바로
                  답변해 드립니다.
                </p>
              </div>
            )}
            {started && messages.length === 0 && mode === 'human' && (
              <div className={styles.chatBubbleBot}>
                <p>
                  {activeCategory?.label} 관련 문의 내용을 남겨 주세요. 상담사가 확인 후 순차적으로
                  답변드립니다.
                </p>
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={message.from === 'student' ? styles.chatBubbleUser : styles.chatBubbleBot}
              >
                {(message.from === 'ai' || message.from === 'admin') && (
                  <span className={styles.chatBubbleTag}>
                    {message.from === 'ai' ? 'AI' : '상담사'}
                  </span>
                )}
                <p>{message.text}</p>
              </div>
            ))}
            {aiThinking && (
              <div className={styles.chatBubbleBot}>
                <p>답변을 작성하고 있어요…</p>
              </div>
            )}
          </div>
          <div className={styles.chatOptions}>
            {!category && (
              <div className={styles.chatQuickGrid}>
                {categories.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    disabled={starting}
                    onClick={() => selectCategory(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
            {category && !started && (
              <div className={styles.chatModeGrid}>
                <button
                  type="button"
                  className={styles.chatModeCard}
                  disabled={starting}
                  onClick={() => void selectMode('ai')}
                >
                  <strong>🤖 AI 채팅</strong>
                  <span>학사 안내를 바탕으로 즉시 답변</span>
                </button>
                <button
                  type="button"
                  className={styles.chatModeCard}
                  disabled={starting}
                  onClick={() => void selectMode('human')}
                >
                  <strong>💬 상담사 채팅</strong>
                  <span>담당자가 직접 확인 후 답변</span>
                </button>
                <button type="button" className={styles.chatTextButton} onClick={reset}>
                  ← 다른 항목 선택
                </button>
              </div>
            )}
            {started && (
              <>
                <div className={styles.chatQuickGrid}>
                  {mode === 'ai' &&
                    categoryQuestions.map((question) => (
                      <button
                        type="button"
                        key={question.id}
                        disabled={aiThinking}
                        onClick={() => void send(question.text)}
                      >
                        {question.text}
                      </button>
                    ))}
                  {mode === 'ai' && (
                    <button type="button" onClick={() => void switchToHuman()}>
                      상담사 연결
                    </button>
                  )}
                  <button type="button" onClick={backToModeSelect}>
                    상담 방식 변경
                  </button>
                  <button type="button" onClick={reset}>
                    다른 항목 선택
                  </button>
                </div>
                <form className={styles.chatCustomForm} onSubmit={onCustomSubmit}>
                  <input
                    value={customText}
                    onChange={(event) => setCustomText(event.target.value)}
                    placeholder={
                      mode === 'ai' ? '궁금한 내용을 입력해 주세요' : '상담사에게 남길 내용을 입력해 주세요'
                    }
                    aria-label="문의 내용"
                  />
                  <button type="submit" disabled={aiThinking}>
                    보내기
                  </button>
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
