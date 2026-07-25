import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChatInfoPanel } from '../components/ChatInfoPanel'
import { Layout } from '../components/Layout'
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
import { detectCategory } from '../constants'
import { getCategory, type CategoryId, type ChatMessage } from '../types/academic'
import {
  normalizeStudentNumber,
  resolveStudentIdentity,
  studentNumberWarning,
  validateIdentityField,
  type IdentityErrors,
  type IdentityField,
  STUDENT_NUMBER_LENGTH,
} from '../utils/studentIdentity'
import munmuniMascot from '../assets/munmuni-mascot.png'
import styles from '../App.module.css'

const STORAGE_KEY = 'hannon-chat-session'
const LOCAL = 'local'

type ChatMode = 'ai' | 'human'

type StoredSession = {
  conversationId: string
  category: CategoryId
  mode: ChatMode
  inquiryLogged?: boolean
}

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

export function ChatPage() {
  const { categories, checklists, contacts, departments, faqEntries, notices } = useAcademicData()
  const [searchParams, setSearchParams] = useSearchParams()

  // 모든 대화는 AI로 시작하고, '상담사 연결'로 관리자 문의(human)로 승격한다.
  const [mode, setMode] = useState<ChatMode>('ai')
  const [category, setCategory] = useState<CategoryId | null>(null)
  const [studentName, setStudentName] = useState('')
  const [studentNumber, setStudentNumber] = useState('')
  const [studentDepartment, setStudentDepartment] = useState('')
  // 필드별 오류 문구. 입력 중이 아니라 blur/제출 시점에만 채운다.
  const [identityErrors, setIdentityErrors] = useState<IdentityErrors>({})
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [customText, setCustomText] = useState('')
  const [starting, setStarting] = useState(false)
  const [aiThinking, setAiThinking] = useState(false)
  const [escalateOpen, setEscalateOpen] = useState(false)
  const [queuedMessage, setQueuedMessage] = useState<string | null>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const inquiryLoggedRef = useRef(false)
  const didInitRef = useRef(false)

  const localMode = conversationId === LOCAL
  const activeCategory = categories.find((item) => item.id === category)

  // 히어로 검색이 카테고리 없이 들어올 때 사용할 기본 카테고리(기타 우선).
  const defaultCategoryId = (): CategoryId | undefined =>
    categories.find((item) => item.id === 'etc')?.id ?? categories[0]?.id

  const pushLocal = (from: ChatMessage['from'], text: string) => {
    setMessages((current) => [...current, { id: uid(), from, text, createdAt: Date.now() }])
  }

  // 대화 생성 후 AI 채팅 시작.
  const startConversation = async (cat: CategoryId) => {
    setStarting(true)
    setMode('ai')
    setEscalateOpen(false)
    setStudentName('')
    setStudentNumber('')
    setStudentDepartment('')
    setIdentityErrors({})
    setCategory(cat)
    const convId = await createConversation(cat)
    const nextId = convId ?? LOCAL
    setConversationId(nextId)
    setMessages([])
    inquiryLoggedRef.current = false
    if (convId) saveSession({ conversationId: convId, category: cat, mode: 'ai' })
    setStarting(false)
  }

  // 진입 시 1회: ?c=카테고리 / ?q=질문 이 있으면 새 대화 시작, 없으면 세션 복구.
  useEffect(() => {
    if (didInitRef.current || categories.length === 0) return
    didInitRef.current = true

    const c = searchParams.get('c') ?? undefined
    const q = searchParams.get('q') ?? undefined

    if (c || q) {
      // 카테고리 카드로 온 경우(c)는 그 카테고리, 히어로 검색(q)만 온 경우는 질문에서 키워드로 추정한다.
      const explicit = c && categories.some((item) => item.id === c) ? c : undefined
      const detected = q ? detectCategory(q, categories) : undefined
      const cat = explicit ?? detected ?? defaultCategoryId()
      if (cat) {
        if (q) setQueuedMessage(q)
        void startConversation(cat)
      }
      // 새로고침 시 재전송되지 않도록 파라미터 제거
      setSearchParams({}, { replace: true })
      return
    }

    const session = loadSession()
    if (session) {
      setMode(session.mode)
      setCategory(session.category)
      setConversationId(session.conversationId)
      inquiryLoggedRef.current = Boolean(session.inquiryLogged)
    } else {
      const cat = defaultCategoryId()
      if (cat) void startConversation(cat)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories])

  // 메시지 실시간 구독 (로컬 모드는 제외)
  useEffect(() => {
    if (!conversationId || conversationId === LOCAL) return
    const unsubscribe = subscribeMessages(conversationId, setMessages)
    return unsubscribe
  }, [conversationId])

  // 스크롤 하단 고정 + 읽음 처리
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' })
    if (conversationId && conversationId !== LOCAL) void markConversationReadByStudent(conversationId)
  }, [messages, conversationId, aiThinking])

  // 대화가 준비되면 대기 중인 첫 메시지를 자동 전송
  useEffect(() => {
    if (!queuedMessage || !conversationId || !category || mode !== 'ai') return
    const message = queuedMessage
    setQueuedMessage(null)
    void send(message)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queuedMessage, conversationId, category, mode])

  const logInquiryOnce = (text: string) => {
    if (!category || !conversationId || conversationId === LOCAL || inquiryLoggedRef.current) return
    inquiryLoggedRef.current = true
    saveSession({ conversationId, category, mode, inquiryLogged: true })
    void createChatInquiry(category, text, conversationId)
  }

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
      contacts: contacts
        .filter((item) => item.categories.includes(cat))
        .map((item) => ({ team: item.team, topic: item.topic, phone: item.phone })),
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
    logInquiryOnce(trimmed)

    setAiThinking(true)
    try {
      const result = await askAi(payload)
      await sendStudentMessage(conversationId, 'ai', result.answer)
      if (!result.confident) {
        await sendStudentMessage(
          conversationId,
          'bot',
          '더 정확한 안내가 필요하시면 위 "상담사 연결"을 눌러 주세요.',
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

  const sendToHuman = async (trimmed: string) => {
    if (!category || !conversationId) return
    if (localMode) {
      pushLocal('student', trimmed)
      pushLocal('bot', '데모 모드에서는 상담사 답변이 지원되지 않습니다.')
      return
    }
    await sendStudentMessage(conversationId, 'student', trimmed)
    logInquiryOnce(trimmed)
  }

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || !category || !conversationId || aiThinking) return
    setCustomText('')
    if (mode === 'ai') await sendToAi(trimmed)
    else await sendToHuman(trimmed)
  }

  // 카테고리 변경 → 해당 카테고리로 새 대화 시작
  const onCategoryChange = (id: CategoryId) => {
    if (id === category || starting) return
    void startConversation(id)
  }

  const requestEscalation = () => {
    if (localMode) {
      pushLocal('bot', '데모 모드에서는 상담사 연결이 지원되지 않습니다.')
      return
    }
    setStudentName('')
    setStudentNumber('')
    setStudentDepartment('')
    setIdentityErrors({})
    setEscalateOpen(true)
  }

  // 입력 중에는 오류를 지우고, 포커스가 빠질 때(blur) 그 필드만 검증한다.
  const clearFieldError = (field: IdentityField) =>
    setIdentityErrors((current) => ({ ...current, [field]: undefined }))

  const checkField = (field: IdentityField, value: string) =>
    setIdentityErrors((current) => ({
      ...current,
      [field]: validateIdentityField(field, value, departments),
    }))

  const submitEscalation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!conversationId || conversationId === LOCAL || !category || starting) return

    const { ok, errors, value } = resolveStudentIdentity(
      { studentName, studentNumber, studentDepartment },
      departments,
    )
    setIdentityErrors(errors)
    if (!ok) return

    setStarting(true)
    await escalateToHuman(conversationId, value)
    await sendStudentMessage(conversationId, 'bot', '상담사에게 연결했어요. 확인 후 순차적으로 답변드립니다.')
    setMode('human')
    saveSession({ conversationId, category, mode: 'human', inquiryLogged: inquiryLoggedRef.current })
    setEscalateOpen(false)
    setStarting(false)
  }

  const onCustomSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void send(customText)
  }

  // 형식은 맞지만 입학연도(앞 4자리)가 어색한 학번은 경고만 하고 제출은 막지 않는다.
  const numberWarning = studentNumberWarning(studentNumber)

  // AI 상담 추천 질문 = 해당 카테고리 FAQ 질문
  const categoryQuestions = category
    ? faqEntries
        .filter((faq) => faq.category === category)
        .slice(0, 6)
        .map((faq) => ({ id: faq.id, text: faq.question }))
    : []

  return (
    <Layout fullHeight>
      <div className={styles.chatLayout}>
      <div className={styles.chatPage}>
        <div className={styles.chatPageHeader}>
          <div className={styles.chatPageHeaderInfo}>
            <Link to="/" className={styles.chatPageBack} aria-label="홈으로">
              ‹
            </Link>
            <span className={styles.chatPageAvatar}>
              <img src={munmuniMascot} alt="" aria-hidden="true" />
            </span>
            <span className={styles.chatPageTitle}>
              <strong>문무니 AI 상담</strong>
              <span>
                {mode === 'ai' ? 'AI가 학사 정보를 안내해 드려요' : '상담사가 확인 후 답변드려요'}
              </span>
            </span>
          </div>
          {mode === 'ai' ? (
            <button
              type="button"
              className={styles.chatPageEscalate}
              onClick={requestEscalation}
              disabled={aiThinking || starting || localMode}
            >
              상담사 연결
            </button>
          ) : (
            <span className={styles.chatPageHumanBadge}>상담사 연결됨</span>
          )}
        </div>

        <div className={styles.chatPageToolbar}>
          <label className={styles.chatPageCategory}>
            <span>학사 항목</span>
            <select
              value={category ?? ''}
              onChange={(event) => onCategoryChange(event.target.value)}
              disabled={starting || categories.length === 0}
            >
              {categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div
          className={`${styles.chatPageMessages} ${
            messages.length === 0 && !aiThinking ? styles.chatPageMessagesEmpty : ''
          }`}
          ref={bodyRef}
        >
          {messages.length === 0 && !aiThinking && (
            <div className={styles.chatWelcome}>
              <img src={munmuniMascot} alt="문무니" className={styles.chatWelcomeMascot} />
              <strong>{mode === 'ai' ? '무엇이든 물어보세요!' : '문의 내용을 남겨 주세요'}</strong>
              <p>
                {mode === 'ai'
                  ? `${activeCategory?.label ?? '학사'} 관련 궁금한 점을 아래에서 선택하거나 직접 입력해 주세요.`
                  : `${activeCategory?.label ?? '학사'} 관련 문의 내용을 남겨 주세요. 상담사가 확인 후 순차적으로 답변드립니다.`}
              </p>
            </div>
          )}
          {messages.map((message) => {
            if (message.from === 'student') {
              return (
                <div key={message.id} className={styles.chatRowUser}>
                  <div className={styles.chatBubbleUser}>
                    <p>{message.text}</p>
                  </div>
                </div>
              )
            }
            const label = senderLabel(message.from)
            const isAdmin = message.from === 'admin'
            return (
              <div key={message.id} className={styles.chatRowBot}>
                <span className={styles.chatAvatar} aria-hidden="true">
                  {isAdmin ? (
                    <span className={styles.chatAvatarAdmin}>상담</span>
                  ) : (
                    <img src={munmuniMascot} alt="" />
                  )}
                </span>
                <div className={styles.chatBubbleBot}>
                  {label && <span className={styles.chatBubbleTag}>{label}</span>}
                  <p>{message.text}</p>
                </div>
              </div>
            )
          })}
          {aiThinking && (
            <div className={styles.chatRowBot}>
              <span className={styles.chatAvatar} aria-hidden="true">
                <img src={munmuniMascot} alt="" />
              </span>
              <div className={styles.chatBubbleBot}>
                <p className={styles.chatTyping}>
                  <span />
                  <span />
                  <span />
                </p>
              </div>
            </div>
          )}
        </div>

        <div className={styles.chatPageComposer}>
          {mode === 'ai' && messages.length === 0 && categoryQuestions.length > 0 && (
            <div className={styles.chatQuickWrap}>
              <span className={styles.chatQuickLabel}>추천 질문</span>
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
              </div>
            </div>
          )}
          <form className={styles.chatCustomForm} onSubmit={onCustomSubmit}>
            <input
              value={customText}
              onChange={(event) => setCustomText(event.target.value)}
              placeholder={mode === 'ai' ? '궁금한 내용을 입력해 주세요' : '상담사에게 남길 내용을 입력해 주세요'}
              aria-label="문의 내용"
              autoFocus
            />
            <button type="submit" disabled={aiThinking} aria-label="보내기">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="m13 5 7 7-7 7" />
              </svg>
            </button>
          </form>
        </div>
      </div>

        {category && <ChatInfoPanel categoryId={category} />}
      </div>

      {escalateOpen && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true" aria-label="상담사 연결">
          <div className={styles.modal}>
            <h2>상담사 연결</h2>
            <p className={styles.contactHours}>
              상담사 연결 전 학번, 학과, 이름을 알려주세요. 상담사가 확인 후 답변드립니다.
            </p>
            <form className={styles.chatIdentityForm} onSubmit={submitEscalation} noValidate>
              <div className={styles.chatIdentityField}>
                <input
                  value={studentNumber}
                  // 숫자만 남기고 최대 자릿수까지만 받는다(하이픈·공백·전각숫자 입력 허용).
                  onChange={(event) => {
                    setStudentNumber(normalizeStudentNumber(event.target.value))
                    clearFieldError('studentNumber')
                  }}
                  onBlur={(event) => checkField('studentNumber', event.target.value)}
                  placeholder={`학번 (숫자 ${STUDENT_NUMBER_LENGTH}자리)`}
                  aria-label="학번"
                  aria-invalid={Boolean(identityErrors.studentNumber)}
                  aria-describedby="escalate-number-help"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={STUDENT_NUMBER_LENGTH}
                  autoFocus
                />
                <p id="escalate-number-help" className={styles.fieldMessage}>
                  {identityErrors.studentNumber ? (
                    <span className={styles.fieldError}>{identityErrors.studentNumber}</span>
                  ) : (
                    numberWarning && <span className={styles.fieldWarning}>{numberWarning}</span>
                  )}
                </p>
              </div>

              <div className={styles.chatIdentityField}>
                <input
                  value={studentDepartment}
                  onChange={(event) => {
                    setStudentDepartment(event.target.value)
                    clearFieldError('studentDepartment')
                  }}
                  onBlur={(event) => checkField('studentDepartment', event.target.value)}
                  placeholder={departments.length > 0 ? '학과 (목록에서 선택)' : '학과'}
                  aria-label="학과"
                  aria-invalid={Boolean(identityErrors.studentDepartment)}
                  aria-describedby="escalate-department-help"
                  list={departments.length > 0 ? 'escalate-departments' : undefined}
                  autoComplete="off"
                  maxLength={30}
                />
                {departments.length > 0 && (
                  <datalist id="escalate-departments">
                    {departments.map((department) => (
                      <option key={department.id} value={department.label} />
                    ))}
                  </datalist>
                )}
                <p id="escalate-department-help" className={styles.fieldMessage}>
                  {identityErrors.studentDepartment && (
                    <span className={styles.fieldError}>{identityErrors.studentDepartment}</span>
                  )}
                </p>
              </div>

              <div className={styles.chatIdentityField}>
                <input
                  value={studentName}
                  onChange={(event) => {
                    setStudentName(event.target.value)
                    clearFieldError('studentName')
                  }}
                  onBlur={(event) => checkField('studentName', event.target.value)}
                  placeholder="이름"
                  aria-label="이름"
                  aria-invalid={Boolean(identityErrors.studentName)}
                  aria-describedby="escalate-name-help"
                  autoComplete="off"
                  maxLength={30}
                />
                <p id="escalate-name-help" className={styles.fieldMessage}>
                  {identityErrors.studentName && (
                    <span className={styles.fieldError}>{identityErrors.studentName}</span>
                  )}
                </p>
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={() => setEscalateOpen(false)}>
                  취소
                </button>
                <button
                  type="submit"
                  disabled={
                    starting ||
                    !studentNumber.trim() ||
                    !studentDepartment.trim() ||
                    !studentName.trim()
                  }
                >
                  {starting ? '연결하는 중…' : '상담사 연결'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
