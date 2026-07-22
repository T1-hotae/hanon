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

const senderLabel = (from: ChatMessage['from']): string | null => {
  if (from === 'ai') return 'AI 도우미'
  if (from === 'admin') return '상담사'
  if (from === 'bot') return '안내'
  return null
}

export function ChatWidget() {
  const { categories, checklists, faqEntries, keywordPresets, notices } = useAcademicData()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<ChatMode | null>(null)
  const [category, setCategory] = useState<CategoryId | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [customText, setCustomText] = useState('')
  const [starting, setStarting] = useState(false)
  const [aiThinking, setAiThinking] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)

  const localMode = conversationId === LOCAL
  const started = Boolean(conversationId && category && mode)

  // 현재 단계: mode → category → chat
  const step: 'mode' | 'category' | 'chat' = !mode ? 'mode' : !started ? 'category' : 'chat'

  // 저장된 세션 복구
  useEffect(() => {
    const session = loadSession()
    if (session) {
      setMode(session.mode)
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
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' })
    if (conversationId && conversationId !== LOCAL) void markConversationReadByStudent(conversationId)
  }, [messages, open, conversationId, aiThinking])

  const pushLocal = (from: ChatMessage['from'], text: string) => {
    setMessages((current) => [...current, { id: uid(), from, text, createdAt: Date.now() }])
  }

  // ① 상담 방식 선택 (AI / 관리자 문의)
  const selectMode = (nextMode: ChatMode) => {
    if (starting) return
    setMode(nextMode)
    setCategory(null)
    setConversationId(null)
    setMessages([])
  }

  // ② 항목 선택 → 대화 생성 후 채팅 시작
  const selectCategory = async (id: CategoryId) => {
    if (!mode || starting) return
    setStarting(true)
    setCategory(id)
    const convId = await createConversation(id)
    const nextId = convId ?? LOCAL
    setConversationId(nextId)
    setMessages([])
    if (convId) {
      saveSession({ conversationId: convId, category: id, mode })
      if (mode === 'human') {
        await sendStudentMessage(convId, 'bot', '상담사에게 연결했어요. 확인 후 순차적으로 답변드립니다.')
        await escalateToHuman(convId)
      }
    } else if (mode === 'human') {
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

  // 관리자 문의: 학생 메시지만 전송. 답변은 관리자가 직접 작성한다.
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
    if (!conversationId || !category) return
    setMode('human')
    saveSession({ conversationId, category, mode: 'human' })
    if (localMode) {
      pushLocal('bot', '데모 모드에서는 상담사 연결이 지원되지 않습니다.')
      return
    }
    await sendStudentMessage(conversationId, 'bot', '상담사에게 연결했어요. 확인 후 순차적으로 답변드립니다.')
    await escalateToHuman(conversationId)
  }

  // 헤더 뒤로가기: 채팅 → 항목선택 → 방식선택
  const goBack = () => {
    setCustomText('')
    if (step === 'chat') {
      setConversationId(null)
      setCategory(null)
      setMessages([])
      saveSession(null)
    } else if (step === 'category') {
      setMode(null)
    }
  }

  const onCustomSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void send(customText)
  }

  const categoryQuestions = category
    ? keywordPresets.filter((question) => question.category === category)
    : []
  const activeCategory = categories.find((item) => item.id === category)

  const headerTitle = () => {
    if (step === 'mode') return '채팅 상담'
    const modeLabel = mode === 'ai' ? 'AI 상담' : '관리자 문의'
    if (step === 'category') return modeLabel
    return activeCategory ? `${activeCategory.label} · ${modeLabel}` : modeLabel
  }

  return (
    <div className={styles.chatWidget}>
      {open && (
        <div className={styles.chatPanel} role="dialog" aria-label="채팅 상담">
          <div className={styles.chatHeader}>
            {step !== 'mode' ? (
              <button
                type="button"
                className={styles.chatHeaderBack}
                onClick={goBack}
                aria-label="뒤로 가기"
              >
                ‹
              </button>
            ) : (
              <span className={styles.chatHeaderSpacer} aria-hidden="true" />
            )}
            <strong>{headerTitle()}</strong>
            <button
              type="button"
              className={styles.chatHeaderClose}
              onClick={() => setOpen(false)}
              aria-label="닫기"
            >
              ×
            </button>
          </div>

          <div className={styles.chatBody} ref={bodyRef}>
            {step === 'mode' && (
              <div className={styles.chatIntro}>
                <div className={styles.chatBubbleBot}>
                  <p>안녕하세요! 어떻게 상담을 도와드릴까요?</p>
                </div>
                <div className={styles.chatModeGrid}>
                  <button
                    type="button"
                    className={styles.chatModeCard}
                    disabled={starting}
                    onClick={() => selectMode('ai')}
                  >
                    <span className={styles.chatModeIcon} aria-hidden="true">🤖</span>
                    <strong>AI 상담</strong>
                    <span>학사 안내를 바탕으로 즉시 답변해 드려요.</span>
                  </button>
                  <button
                    type="button"
                    className={styles.chatModeCard}
                    disabled={starting}
                    onClick={() => selectMode('human')}
                  >
                    <span className={styles.chatModeIcon} aria-hidden="true">💬</span>
                    <strong>관리자 문의</strong>
                    <span>담당 상담사가 직접 확인 후 답변드려요.</span>
                  </button>
                </div>
              </div>
            )}

            {step === 'category' && (
              <div className={styles.chatIntro}>
                <div className={styles.chatBubbleBot}>
                  <p>
                    어떤 항목이 궁금하신가요? {mode === 'ai' ? 'AI가 바로' : '상담사가 확인 후'} 답변해
                    드립니다.
                  </p>
                </div>
                <div className={styles.chatCategoryGrid}>
                  {categories.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      className={styles.chatCategoryCard}
                      disabled={starting}
                      onClick={() => void selectCategory(item.id)}
                    >
                      <strong>{item.label}</strong>
                      {item.description && <span>{item.description}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 'chat' && (
              <>
                {messages.length === 0 && (
                  <div className={styles.chatBubbleBot}>
                    {senderLabel(mode === 'ai' ? 'ai' : 'admin') && (
                      <span className={styles.chatBubbleTag}>
                        {mode === 'ai' ? 'AI 도우미' : '상담사'}
                      </span>
                    )}
                    <p>
                      {mode === 'ai'
                        ? `${activeCategory?.label} 관련 궁금한 점을 선택하거나 직접 입력해 주세요.`
                        : `${activeCategory?.label} 관련 문의 내용을 남겨 주세요. 상담사가 확인 후 순차적으로 답변드립니다.`}
                    </p>
                  </div>
                )}
                {messages.map((message) => {
                  const label = senderLabel(message.from)
                  return (
                    <div
                      key={message.id}
                      className={
                        message.from === 'student' ? styles.chatBubbleUser : styles.chatBubbleBot
                      }
                    >
                      {label && <span className={styles.chatBubbleTag}>{label}</span>}
                      <p>{message.text}</p>
                    </div>
                  )
                })}
                {aiThinking && (
                  <div className={styles.chatBubbleBot}>
                    <span className={styles.chatBubbleTag}>AI 도우미</span>
                    <p className={styles.chatTyping}>
                      <span />
                      <span />
                      <span />
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {step === 'chat' && (
            <div className={styles.chatOptions}>
              {mode === 'ai' && (
                <div className={styles.chatQuickGrid}>
                  {categoryQuestions.map((question) => (
                    <button
                      type="button"
                      key={question.id}
                      disabled={aiThinking}
                      onClick={() => void send(question.text)}
                    >
                      {question.text}
                    </button>
                  ))}
                  <button
                    type="button"
                    className={styles.chatQuickAccent}
                    onClick={() => void switchToHuman()}
                  >
                    상담사 연결하기
                  </button>
                </div>
              )}
              <form className={styles.chatCustomForm} onSubmit={onCustomSubmit}>
                <input
                  value={customText}
                  onChange={(event) => setCustomText(event.target.value)}
                  placeholder={
                    mode === 'ai'
                      ? '궁금한 내용을 입력해 주세요'
                      : '상담사에게 남길 내용을 입력해 주세요'
                  }
                  aria-label="문의 내용"
                />
                <button type="submit" disabled={aiThinking}>
                  보내기
                </button>
              </form>
            </div>
          )}
        </div>
      )}
      <button
        type="button"
        className={styles.chatToggle}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? '닫기' : '채팅 상담'}
      </button>
    </div>
  )
}
