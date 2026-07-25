import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChatHistoryPanel } from '../components/ChatHistoryPanel'
import { Layout } from '../components/Layout'
import { useAcademicData } from '../context/useAcademicData'
import {
  askAi,
  createConversation,
  createHumanConversation,
  ensureAnonymousAuth,
  markConversationReadByStudent,
  sendStudentMessage,
  setConversationCategory,
  subscribeMessages,
  subscribeStudentConversations,
  type AiChatPayload,
  type ConversationSummary,
} from '../services/chatService'
import { createChatInquiry } from '../services/inquiryService'
import { detectCategory } from '../constants'
import type { ChatMessage } from '../types/academic'
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
  const { categories, checklists, contacts, departments, faqEntries, notices, loading } =
    useAcademicData()
  const [searchParams, setSearchParams] = useSearchParams()

  // 채팅은 학사 항목을 구분하지 않는다. 무엇을 물어도 전체 학사 자료로 답한다.
  // AI 채팅과 상담사 채팅은 완전히 분리된 별개의 대화다. 한 대화의 mode는 끝까지 바뀌지 않는다.
  // '상담사 연결'을 누르면 지금 AI 대화는 그대로 두고 상담사 전용 새 대화를 열어 그쪽으로 이동한다.
  const [mode, setMode] = useState<ChatMode>('ai')
  const [studentName, setStudentName] = useState('')
  const [studentNumber, setStudentNumber] = useState('')
  const [studentDepartment, setStudentDepartment] = useState('')
  // 필드별 오류 문구. 입력 중이 아니라 blur/제출 시점에만 채운다.
  const [identityErrors, setIdentityErrors] = useState<IdentityErrors>({})
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [customText, setCustomText] = useState('')
  const [starting, setStarting] = useState(false)
  const [aiThinking, setAiThinking] = useState(false)
  const [escalateOpen, setEscalateOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(() => searchParams.get('history') === '1')
  // 상담사 대화 생성 실패 안내(모달 안에 표시). 대화 내용과 섞이지 않게 별도 상태로 둔다.
  const [escalateError, setEscalateError] = useState<string | null>(null)
  const [queuedMessage, setQueuedMessage] = useState<string | null>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const inquiryLoggedRef = useRef(false)
  const didInitRef = useRef(false)

  const localMode = conversationId === LOCAL

  const closeHistory = () => {
    setHistoryOpen(false)
    if (!searchParams.has('history')) return
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('history')
    setSearchParams(nextParams, { replace: true })
  }

  const pushLocal = (from: ChatMessage['from'], text: string) => {
    setMessages((current) => [...current, { id: uid(), from, text, createdAt: Date.now() }])
  }

  // 대화 생성 후 AI 채팅 시작.
  const startConversation = async () => {
    setStarting(true)
    setMode('ai')
    setEscalateOpen(false)
    setStudentName('')
    setStudentNumber('')
    setStudentDepartment('')
    setIdentityErrors({})
    const convId = await createConversation()
    const nextId = convId ?? LOCAL
    setConversationId(nextId)
    setMessages([])
    inquiryLoggedRef.current = false
    if (convId) saveSession({ conversationId: convId, mode: 'ai' })
    setStarting(false)
  }

  // 진입 시 1회: ?q=질문 이 있으면 그 질문으로 새 대화 시작, 없으면 세션 복구.
  // 학사 자료(FAQ·공지 등)가 로드된 뒤에 시작해야 첫 질문에 제대로 답할 수 있다.
  useEffect(() => {
    if (didInitRef.current || loading) return
    didInitRef.current = true

    const q = searchParams.get('q') ?? undefined

    if (q) {
      setQueuedMessage(q)
      void startConversation()
      // 새로고침 시 재전송되지 않도록 파라미터 제거
      setSearchParams({}, { replace: true })
      return
    }

    const session = loadSession()
    if (session) {
      setMode(session.mode)
      setConversationId(session.conversationId)
      inquiryLoggedRef.current = Boolean(session.inquiryLogged)
    } else {
      void startConversation()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  // 상단 채팅 아이콘으로 들어오면 모바일에서는 이전 채팅 기록을 바로 펼친다.
  useEffect(() => {
    if (searchParams.get('history') === '1') setHistoryOpen(true)
  }, [searchParams])

  // 메시지 실시간 구독 (로컬 모드는 제외)
  useEffect(() => {
    if (!conversationId || conversationId === LOCAL) return
    const unsubscribe = subscribeMessages(conversationId, setMessages)
    return unsubscribe
  }, [conversationId])

  // 내(익명) 지난 대화 목록 실시간 구독 → 왼쪽 채팅 기록 패널
  useEffect(() => {
    let unsubscribe = () => {}
    let cancelled = false
    void ensureAnonymousAuth().then((uid) => {
      if (!uid || cancelled) return
      unsubscribe = subscribeStudentConversations(uid, setConversations)
    })
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  // 스크롤 하단 고정 + 읽음 처리
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' })
    if (conversationId && conversationId !== LOCAL) void markConversationReadByStudent(conversationId)
  }, [messages, conversationId, aiThinking])

  // 대화가 준비되면 대기 중인 첫 메시지를 자동 전송
  useEffect(() => {
    if (!queuedMessage || !conversationId || mode !== 'ai') return
    const message = queuedMessage
    setQueuedMessage(null)
    void send(message)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queuedMessage, conversationId, mode])

  // 통계용 분류는 UI에서 고르지 않고 첫 질문에서 추정한다(추정 실패 시 '기타').
  const logInquiryOnce = (text: string) => {
    if (!conversationId || conversationId === LOCAL || inquiryLoggedRef.current) return
    inquiryLoggedRef.current = true
    saveSession({ conversationId, mode, inquiryLogged: true })
    const detected = detectCategory(text, categories) ?? 'etc'
    void createChatInquiry(detected, text, conversationId)
    void setConversationCategory(conversationId, detected)
  }

  // 학사 항목을 구분하지 않으므로 전체 자료를 그대로 AI에게 전달한다.
  // 항목별 자료(FAQ·체크리스트)에는 어느 항목의 내용인지 라벨을 붙여 섞이지 않게 한다.
  const buildKb = (): AiChatPayload['kb'] => {
    const labelOf = (id: string) => categories.find((item) => item.id === id)?.label ?? '기타'
    return {
      faqs: faqEntries.map((item) => ({
        id: item.id,
        question: `[${labelOf(item.category)}] ${item.question}`,
        answer: item.answer,
      })),
      notices: notices.map((item) => ({
        id: item.id,
        title: `[${labelOf(item.category)}] ${item.title}`,
      })),
      checklist: checklists.flatMap((checklist) =>
        checklist.items.map((item) => ({
          label: `[${labelOf(checklist.category)}] ${item.label}`,
          content: item.content,
        })),
      ),
      contacts: contacts.map((item) => ({
        team: item.team,
        topic: item.topic,
        phone: item.phone,
      })),
      categories: categories.map((item) => ({
        label: item.label,
        phone: item.phone,
        hours: item.hours,
      })),
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
    if (!conversationId) return
    const payload: AiChatPayload = {
      kb: buildKb(),
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
    if (!conversationId) return
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
    if (!trimmed || !conversationId || aiThinking) return
    setCustomText('')
    if (mode === 'ai') await sendToAi(trimmed)
    else await sendToHuman(trimmed)
  }

  // 채팅 기록에서 지난 대화 선택 → 그 대화로 이어보기
  const selectConversation = (item: ConversationSummary) => {
    closeHistory()
    if (starting || item.id === conversationId) return
    const nextMode: ChatMode = item.needsHuman ? 'human' : 'ai'
    setEscalateOpen(false)
    setMessages([])
    setMode(nextMode)
    setConversationId(item.id)
    inquiryLoggedRef.current = true
    saveSession({ conversationId: item.id, mode: nextMode, inquiryLogged: true })
  }

  const startNewConversation = () => {
    if (starting) return
    closeHistory()
    void startConversation()
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
    setEscalateError(null)
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

  // 지금 AI 대화는 건드리지 않고, 상담사 전용 새 대화를 만들어 그 대화로 이동한다.
  const submitEscalation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!conversationId || conversationId === LOCAL || starting) return

    const { ok, errors, value } = resolveStudentIdentity(
      { studentName, studentNumber, studentDepartment },
      departments,
    )
    setIdentityErrors(errors)
    if (!ok) return

    setStarting(true)
    setEscalateError(null)
    const humanId = await createHumanConversation(value, conversationId)
    if (!humanId) {
      setEscalateError('지금은 상담사 연결이 어려워요. 잠시 후 다시 시도해 주세요.')
      setStarting(false)
      return
    }

    // 상담사 대화는 문의 분류를 새로 집계한다(AI 대화와 별개의 문의로 본다).
    inquiryLoggedRef.current = false
    setMessages([])
    setMode('human')
    setConversationId(humanId)
    saveSession({ conversationId: humanId, mode: 'human' })
    await sendStudentMessage(
      humanId,
      'bot',
      '상담사 전용 채팅을 열었어요. 문의 내용을 남겨 주시면 상담사가 확인 후 순차적으로 답변드립니다.',
    )
    setEscalateOpen(false)
    setStarting(false)
  }

  const onCustomSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void send(customText)
  }

  // 형식은 맞지만 입학연도(앞 4자리)가 어색한 학번은 경고만 하고 제출은 막지 않는다.
  const numberWarning = studentNumberWarning(studentNumber)

  // 상담사 채팅은 헤더·아바타·안내 문구를 모두 다르게 보여 AI 채팅과 헷갈리지 않게 한다.
  const isHuman = mode === 'human'

  return (
    <Layout fullHeight>
      <div className={styles.chatLayout}>
        <ChatHistoryPanel
          items={conversations}
          activeId={conversationId}
          disabled={localMode || starting}
          onSelect={selectConversation}
          onNew={startNewConversation}
        />

        <div className={styles.chatPage}>
          <div
            className={`${styles.chatPageHeader} ${isHuman ? styles.chatPageHeaderHuman : ''}`}
          >
            <div className={styles.chatPageHeaderInfo}>
              <Link to="/" className={styles.chatPageBack} aria-label="홈으로">
                ‹
              </Link>
              <span className={styles.chatPageAvatar}>
                {isHuman ? (
                  <span className={styles.chatPageAvatarAdmin}>상담</span>
                ) : (
                  <img src={munmuniMascot} alt="" aria-hidden="true" />
                )}
              </span>
              <span className={styles.chatPageTitle}>
                <strong>{isHuman ? '상담사 상담' : '문무니 AI 상담'}</strong>
                <span>
                  {isHuman ? '상담사가 확인 후 답변드려요' : 'AI가 학사 정보를 안내해 드려요'}
                </span>
              </span>
            </div>
            {isHuman ? (
              <span className={styles.chatPageHumanBadge}>상담사 연결됨</span>
            ) : (
              <button
                type="button"
                className={styles.chatPageEscalate}
                onClick={requestEscalation}
                disabled={aiThinking || starting || localMode}
              >
                상담사 연결
              </button>
            )}
          </div>

          <div
            className={`${styles.chatPageMessages} ${
              messages.length === 0 && !aiThinking ? styles.chatPageMessagesEmpty : ''
            }`}
            ref={bodyRef}
          >
            {messages.length === 0 && !aiThinking && (
              <div className={styles.chatWelcome}>
                {isHuman ? (
                  <span className={styles.chatWelcomeAdmin} aria-hidden="true">
                    상담
                  </span>
                ) : (
                  <img src={munmuniMascot} alt="문무니" className={styles.chatWelcomeMascot} />
                )}
                <strong>{isHuman ? '상담사 전용 채팅이에요' : '무엇이든 물어보세요!'}</strong>
                <p>
                  {isHuman
                    ? '문의 내용을 남겨 주세요. 상담사가 확인 후 순차적으로 답변드립니다. AI 답변은 오지 않아요.'
                    : '수강신청·장학금·졸업요건 등 학사 관련 궁금한 점을 아래에 입력해 주세요.'}
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
            <form className={styles.chatCustomForm} onSubmit={onCustomSubmit}>
              <input
                value={customText}
                onChange={(event) => setCustomText(event.target.value)}
                placeholder={isHuman ? '상담사에게 남길 내용을 입력해 주세요' : '궁금한 내용을 입력해 주세요'}
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
      </div>

      {historyOpen && (
        <div className={styles.chatHistoryDrawerBackdrop}>
          <button
            type="button"
            className={styles.chatHistoryDrawerDismiss}
            onClick={closeHistory}
            aria-label="채팅 기록 닫기"
          />
          <section
            className={styles.chatHistoryDrawer}
            role="dialog"
            aria-modal="true"
            aria-label="이전 채팅 기록"
          >
            <div className={styles.chatHistoryDrawerToolbar}>
              <strong>이전 채팅 기록</strong>
              <button type="button" onClick={closeHistory} aria-label="채팅 기록 닫기">
                ×
              </button>
            </div>
            <ChatHistoryPanel
              items={conversations}
              activeId={conversationId}
              disabled={localMode || starting}
              onSelect={selectConversation}
              onNew={startNewConversation}
            />
          </section>
        </div>
      )}

      {escalateOpen && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true" aria-label="상담사 연결">
          <div className={styles.modal}>
            <h2>상담사 연결</h2>
            <p className={styles.contactHours}>
              학번, 학과, 이름을 알려주세요. 지금 AI 대화와 별개로 <strong>상담사 전용 채팅</strong>이
              새로 열립니다.
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

              {escalateError && <p className={styles.fieldError}>{escalateError}</p>}

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
                  {starting ? '채팅 여는 중…' : '상담사 채팅 열기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
