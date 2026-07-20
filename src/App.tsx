import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import { AcademicDataProvider } from './context/AcademicDataContext'
import { useAcademicData } from './context/useAcademicData'
import { presetQuestions } from './mock/presetQuestions'
import { answeredFaqGroups, groupInquiries, type InquiryGroup } from './services/analytics'
import { CATEGORIES, getCategory, type CategoryId } from './types/academic'
import styles from './App.module.css'

const formatDate = (timestamp: number) =>
  new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(timestamp)
    .replaceAll('. ', '.')
    .replace('.', '')

const categoryOptions = CATEGORIES
const primaryCategoryOptions = CATEGORIES.filter((category) => category.id !== 'etc')

function Header() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const navigate = useNavigate()
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  // TODO: 실 서비스 전환 시 관리자 인증 필요 (학교 계정 SSO 연동 검토)
  // 현재는 프로토타입 범위로 토글 전환만 지원
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = query.trim()
    if (trimmed) navigate(`/search?q=${encodeURIComponent(trimmed)}`)
  }

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>
        학사안내
      </Link>
      <form className={styles.searchForm} onSubmit={onSubmit}>
        <input
          aria-label="검색어"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="공지 제목 또는 질문 검색"
        />
        <button type="submit">검색</button>
      </form>
      <button
        type="button"
        className={styles.modeToggle}
        onClick={() => navigate(isAdmin ? '/' : '/admin')}
      >
        {isAdmin ? '학생용' : '관리자용'}
      </button>
    </header>
  )
}

function Layout({ children }: { children: ReactNode }) {
  const { usingMockData } = useAcademicData()

  return (
    <>
      <Header />
      <main className={styles.shell}>
        {usingMockData && (
          <div className={styles.mockNotice}>
            Firebase 환경변수가 없어 목업 데이터로 실행 중입니다.
          </div>
        )}
        {children}
      </main>
    </>
  )
}

function CategoryChips({ limitToPrimary = false }: { limitToPrimary?: boolean }) {
  const categories = limitToPrimary ? primaryCategoryOptions : categoryOptions

  return (
    <div className={styles.quickGrid} aria-label="자주 찾는 항목 바로가기">
      {categories.map((category) => (
        <Link key={category.id} to={`/category/${category.id}`} className={styles.quickChip}>
          <strong>{category.label}</strong>
          <span>{category.description}</span>
        </Link>
      ))}
    </div>
  )
}

function HomePage() {
  const { inquiries, notices } = useAcademicData()
  const topFaqs = answeredFaqGroups(inquiries, 'all').slice(0, 5)
  const latestNotices = [...notices].sort((a, b) => b.postedAt - a.postedAt).slice(0, 10)

  return (
    <Layout>
      <section className={styles.introBand}>
        <p className={styles.eyebrow}>자주 찾는 항목 바로가기</p>
        <h1>흩어진 학사 공지와 반복 문의를 한 화면에서 확인하세요.</h1>
        <CategoryChips limitToPrimary />
      </section>

      <section className={styles.section}>
        <div className={styles.sectionTitle}>
          <h2>지금 많이 묻는 질문 TOP 5</h2>
        </div>
        <div className={styles.rankList}>
          {topFaqs.map((faq, index) => (
            <Link
              key={faq.key}
              to={`/category/${faq.category}?open=${encodeURIComponent(faq.questionText)}`}
              className={styles.rankRow}
            >
              <span>{index + 1}</span>
              <strong>{faq.questionText}</strong>
              <em>{getCategory(faq.category).label}</em>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionTitle}>
          <h2>공지사항</h2>
          <Link to="/notices">+ 더보기</Link>
        </div>
        <NoticeList notices={latestNotices} />
      </section>
    </Layout>
  )
}

function NoticeList({ notices }: { notices: ReturnType<typeof useAcademicData>['notices'] }) {
  return (
    <ul className={styles.noticeList}>
      {notices.map((notice) => (
        <li key={notice.id}>
          <a href={notice.url} target="_blank" rel="noreferrer">
            {notice.title}
          </a>
          <time>{formatDate(notice.postedAt)}</time>
        </li>
      ))}
    </ul>
  )
}

function NoticesPage() {
  const { notices } = useAcademicData()
  const [filter, setFilter] = useState<CategoryId | 'all'>('all')
  const filtered = notices
    .filter((notice) => filter === 'all' || notice.category === filter)
    .sort((a, b) => b.postedAt - a.postedAt)

  return (
    <Layout>
      <section className={styles.section}>
        <div className={styles.sectionTitle}>
          <h1>전체 공지사항</h1>
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value as CategoryId | 'all')}
            aria-label="카테고리 필터"
          >
            <option value="all">전체</option>
            {categoryOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
        <NoticeList notices={filtered} />
      </section>
    </Layout>
  )
}

function CategoryPage() {
  const params = useParams()
  const [searchParams] = useSearchParams()
  const { inquiries, notices } = useAcademicData()
  const categoryId = params.id as CategoryId
  const category = getCategory(categoryId)
  const [modalOpen, setModalOpen] = useState(false)
  const [openQuestion, setOpenQuestion] = useState(searchParams.get('open') ?? '')

  if (!CATEGORIES.some((item) => item.id === categoryId)) return <Navigate to="/" replace />

  const faqs = answeredFaqGroups(inquiries, categoryId)
  const categoryNotices = notices
    .filter((notice) => notice.category === categoryId)
    .sort((a, b) => b.postedAt - a.postedAt)

  return (
    <Layout>
      <div className={styles.keywordArea}>
        <CategoryChips limitToPrimary />
      </div>
      <section className={styles.categoryHero}>
        <div>
          <p className={styles.eyebrow}>빠른 이동 항목</p>
          <h1>{category.label}</h1>
          <p>{category.description}</p>
        </div>
        <button type="button" className={styles.callCard} onClick={() => setModalOpen(true)}>
          <strong>{category.label} 문의</strong>
          <span>전화 바로가기</span>
        </button>
      </section>

      <section className={styles.twoColumn}>
        <div className={styles.section}>
          <h2>가장 많이 묻는 질문</h2>
          <div className={styles.accordion}>
            {faqs.map((faq) => (
              <FaqItem
                key={faq.key}
                faq={faq}
                open={openQuestion === faq.questionText}
                onToggle={() =>
                  setOpenQuestion(openQuestion === faq.questionText ? '' : faq.questionText)
                }
              />
            ))}
          </div>
        </div>
        <aside className={styles.section}>
          <h2>공지사항</h2>
          <NoticeList notices={categoryNotices} />
        </aside>
      </section>

      {modalOpen && (
        <div className={styles.modalBackdrop} role="presentation" onClick={() => setModalOpen(false)}>
          <div className={styles.modal} role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <h2>{category.label} 문의 전화</h2>
            <p className={styles.phoneNumber}>{category.phone}</p>
            <p>{category.hours}</p>
            <div className={styles.modalActions}>
              <a href={`tel:${category.phone}`}>전화 걸기</a>
              <button type="button" onClick={() => setModalOpen(false)}>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

function FaqItem({
  faq,
  open,
  onToggle,
}: {
  faq: InquiryGroup
  open: boolean
  onToggle: () => void
}) {
  const { notices } = useAcademicData()
  const related = notices.filter((notice) => faq.relatedNoticeIds.includes(notice.id))

  return (
    <div className={styles.faqItem}>
      <button type="button" onClick={onToggle} aria-expanded={open}>
        <span>Q. {faq.questionText}</span>
        <em>{faq.total}건</em>
      </button>
      {open && (
        <div className={styles.faqBody}>
          <p>{faq.answerText}</p>
          <strong>원문 공지</strong>
          <ul>
            {related.map((notice) => (
              <li key={notice.id}>
                <a href={notice.url} target="_blank" rel="noreferrer">
                  {notice.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function SearchPage() {
  const [searchParams] = useSearchParams()
  const { inquiries, notices } = useAcademicData()
  const query = (searchParams.get('q') ?? '').trim()
  const lower = query.toLocaleLowerCase()
  const faqMatches = answeredFaqGroups(inquiries, 'all').filter((faq) =>
    faq.questionText.toLocaleLowerCase().includes(lower),
  )
  const noticeMatches = notices
    .filter((notice) => notice.title.toLocaleLowerCase().includes(lower))
    .sort((a, b) => b.postedAt - a.postedAt)
  const hasResults = Boolean(query && (faqMatches.length || noticeMatches.length))
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <Layout>
      <section className={styles.section}>
        <h1>검색 결과</h1>
        <p className={styles.resultMeta}>"{query}" 검색 결과</p>
        {hasResults ? (
          <div className={styles.searchResults}>
            {faqMatches.map((faq) => (
              <Link key={faq.key} to={`/category/${faq.category}?open=${encodeURIComponent(faq.questionText)}`}>
                <span>FAQ</span>
                <strong>{faq.questionText}</strong>
                <em>{getCategory(faq.category).label}</em>
              </Link>
            ))}
            {noticeMatches.map((notice) => (
              <a key={notice.id} href={notice.url} target="_blank" rel="noreferrer">
                <span>공지</span>
                <strong>{notice.title}</strong>
                <em>{formatDate(notice.postedAt)}</em>
              </a>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <h2>관련 정보를 찾지 못했습니다</h2>
            <p>다른 자주 찾는 항목으로 이동하거나 담당 부서에 전화로 문의하세요.</p>
            <CategoryChips limitToPrimary />
            <button type="button" onClick={() => setModalOpen(true)}>
              전화로 문의하기
            </button>
          </div>
        )}
      </section>
      {modalOpen && (
        <div className={styles.modalBackdrop} role="presentation" onClick={() => setModalOpen(false)}>
          <div className={styles.modal} role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <h2>학사 통합 문의</h2>
            <p className={styles.phoneNumber}>02-320-1000</p>
            <p>평일 09:00-17:00, 담당 부서 연결</p>
            <div className={styles.modalActions}>
              <a href="tel:02-320-1000">전화 걸기</a>
              <button type="button" onClick={() => setModalOpen(false)}>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

function AdminPage() {
  const { inquiries } = useAcademicData()
  const [filter, setFilter] = useState<CategoryId | 'all'>('all')
  const groups = groupInquiries(inquiries, filter)
  const navigate = useNavigate()

  return (
    <Layout>
      <section className={styles.adminToolbar}>
        <div>
          <p className={styles.eyebrow}>관리자 대시보드</p>
          <h1>문의 빈도 랭킹</h1>
        </div>
        <Link to="/admin/log-call" className={styles.primaryAction}>
          전화 문의 기록하기
        </Link>
      </section>
      <div className={styles.tabs}>
        <button className={filter === 'all' ? styles.activeTab : ''} onClick={() => setFilter('all')}>전체</button>
        {primaryCategoryOptions.map((category) => (
          <button
            key={category.id}
            className={filter === category.id ? styles.activeTab : ''}
            onClick={() => setFilter(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>
      <section className={styles.tableWrap}>
        <table>
          <thead>
            <tr>
              <th>질문 내용</th>
              <th>총 건수</th>
              <th>채팅</th>
              <th>전화</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <tr key={group.key} onClick={() => navigate(`/admin/answer/${encodeURIComponent(group.key)}`)}>
                <td>
                  <strong>{group.questionText}</strong>
                  <span>{getCategory(group.category).label}</span>
                </td>
                <td>{group.total}</td>
                <td>{group.chat}</td>
                <td>{group.phone}</td>
                <td>
                  <mark className={group.status === 'pending' ? styles.pending : styles.answered}>
                    {group.status === 'pending' ? '미답변' : '답변완료'}
                  </mark>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </Layout>
  )
}

function LogCallPage() {
  const { addPhoneInquiry } = useAcademicData()
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | ''>('')
  const [customMode, setCustomMode] = useState(false)
  const [customText, setCustomText] = useState('')
  const [toast, setToast] = useState('')
  const questions = presetQuestions.filter((question) => question.category === selectedCategory)

  const save = (category: CategoryId, questionText: string) => {
    addPhoneInquiry(category, questionText)
    setSelectedCategory('')
    setCustomMode(false)
    setCustomText('')
    setToast('기록되었습니다')
    window.setTimeout(() => setToast(''), 1800)
  }

  return (
    <Layout>
      <section className={styles.section}>
        <div className={styles.sectionTitle}>
          <h1>전화 문의 기록</h1>
          <Link to="/admin">대시보드로</Link>
        </div>
        <div className={styles.callLogger}>
          <div>
            <h2>1. 카테고리 선택</h2>
            <div className={styles.largeButtonGrid}>
              {categoryOptions.map((category) => (
                <button
                  type="button"
                  key={category.id}
                  className={selectedCategory === category.id ? styles.selectedButton : ''}
                  onClick={() => {
                    setSelectedCategory(category.id)
                    setCustomMode(false)
                  }}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
          {selectedCategory && (
            <div>
              <h2>2. 예시 질문 선택</h2>
              <div className={styles.largeButtonGrid}>
                {questions.map((question) => (
                  <button
                    type="button"
                    key={question.id}
                    onClick={() => save(question.category, question.text)}
                  >
                    {question.text}
                  </button>
                ))}
                <button type="button" onClick={() => setCustomMode(true)}>
                  목록에 없는 기타 문의
                </button>
              </div>
            </div>
          )}
          {customMode && selectedCategory && (
            <form
              className={styles.customQuestion}
              onSubmit={(event) => {
                event.preventDefault()
                if (customText.trim()) save(selectedCategory, customText.trim())
              }}
            >
              <label htmlFor="custom-question">짧은 문의 내용</label>
              <input
                id="custom-question"
                value={customText}
                onChange={(event) => setCustomText(event.target.value)}
                placeholder="예: 장학금 서류 제출 위치 문의"
              />
              <button type="submit">저장</button>
            </form>
          )}
        </div>
      </section>
      {toast && <div className={styles.toast}>{toast}</div>}
    </Layout>
  )
}

function AnswerPage() {
  const params = useParams()
  const navigate = useNavigate()
  const { inquiries, notices, answerInquiryGroup } = useAcademicData()
  const key = decodeURIComponent(params.id ?? '')
  const groups = useMemo(() => groupInquiries(inquiries, 'all'), [inquiries])
  const group = groups.find((item) => item.key === key)
  const [answer, setAnswer] = useState(group?.answerText ?? '')
  const [selectedNoticeIds, setSelectedNoticeIds] = useState<string[]>(group?.relatedNoticeIds ?? [])

  if (!group) return <Navigate to="/admin" replace />

  const categoryNotices = notices.filter((notice) => notice.category === group.category)

  const publish = () => {
    if (!answer.trim()) return
    answerInquiryGroup(group.questionText, group.category, answer.trim(), selectedNoticeIds)
    navigate('/admin')
  }

  return (
    <Layout>
      <section className={styles.section}>
        <div className={styles.answerHeader}>
          <div>
            <p className={styles.eyebrow}>답변 작성·게시</p>
            <h1>{group.questionText}</h1>
            <p>
              총 {group.total}건 · 채팅 {group.chat}건 · 전화 {group.phone}건
            </p>
          </div>
          <mark className={group.status === 'pending' ? styles.pending : styles.answered}>
            {group.status === 'pending' ? '미답변' : '답변완료'}
          </mark>
        </div>
        <label className={styles.formBlock}>
          답변 내용
          <textarea value={answer} onChange={(event) => setAnswer(event.target.value)} rows={8} />
        </label>
        <fieldset className={styles.noticePicker}>
          <legend>연결할 원문 공지</legend>
          {categoryNotices.map((notice) => (
            <label key={notice.id}>
              <input
                type="checkbox"
                checked={selectedNoticeIds.includes(notice.id)}
                onChange={(event) => {
                  setSelectedNoticeIds((current) =>
                    event.target.checked
                      ? [...current, notice.id]
                      : current.filter((id) => id !== notice.id),
                  )
                }}
              />
              <span>{notice.title}</span>
            </label>
          ))}
        </fieldset>
        <button type="button" className={styles.primaryAction} onClick={publish}>
          게시하기
        </button>
      </section>
    </Layout>
  )
}

function AppRoutes() {
  const { loading } = useAcademicData()

  if (loading) return <div className={styles.loading}>불러오는 중입니다.</div>

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/notices" element={<NoticesPage />} />
      <Route path="/category/:id" element={<CategoryPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/admin/log-call" element={<LogCallPage />} />
      <Route path="/admin/answer/:id" element={<AnswerPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AcademicDataProvider>
      <AppRoutes />
    </AcademicDataProvider>
  )
}
