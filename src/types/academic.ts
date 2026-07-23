// 카테고리는 관리자 앱에서 Firestore에 자유롭게 추가된다. 특정 문자열로 고정하지 않는다.
// (예약어 'etc'는 미분류/기타 catch-all 용도로만 관례적으로 사용)
export type CategoryId = string

export type Inquiry = {
  id: string
  source: 'chat' | 'phone'
  category: CategoryId
  questionText: string
  status: 'pending' | 'answered'
  answerText?: string
  relatedNoticeIds?: string[]
  createdAt: number
  answeredAt?: number
}

export type Notice = {
  id: string
  category: CategoryId
  title: string
  url: string
  postedAt: number
  order: number
  viewCount: number
}

export type Category = {
  id: CategoryId
  label: string
  description: string
  phone: string
  hours: string
  order?: number
}

export type FaqEntry = {
  id: string
  category: CategoryId
  question: string
  answer: string
  answerImageUrls: string[]
  relatedNoticeIds: string[]
  order: number
  pinned: boolean
  // 홈 '지금 많이 묻는 질문' 섹션 노출 여부. 교직원이 admin에서 지정한다.
  showOnHome: boolean
  viewCount: number
  updatedAt: number
}

export type ChatMessage = {
  id: string
  from: 'student' | 'admin' | 'bot' | 'ai'
  text: string
  imageUrls?: string[]
  createdAt: number
}

export type Conversation = {
  id: string
  studentId: string
  studentName: string
  studentNumber: string
  category: CategoryId
  status: 'open' | 'answered'
  lastMessage: string
  lastMessageAt: number
  createdAt: number
  unreadForAdmin: boolean
  unreadForStudent: boolean
  needsHuman: boolean
  studentMessageCount: number
}

export type ChecklistItem = {
  id: string
  label: string
  content: string
  order: number
}

export type Checklist = {
  id: string
  category: CategoryId
  order: number
  items: ChecklistItem[]
}

// 학내 부서 연락처(구내전화 안내 기반). 개인 실명은 담지 않고 부서·업무·내선만 노출한다.
export type Contact = {
  id: string
  team: string // 부서/팀명
  topic: string // 담당 업무
  ext: string // 내선(원본 표기)
  phone: string // 걸 수 있는 전체 번호(031-…)
  group: string // 디렉터리 분류(학사, 장학·복지, 진로·취업 등)
  categories: CategoryId[] // 연결된 학사 카테고리
  priority: number // 1이면 카테고리 전화 모달에 노출, 그 외는 디렉터리 전용
  order: number
}

// 카테고리(전과/수강신청/휴학 등)는 전적으로 Firestore `categories`에서 온다.
// 하드코딩 폴백은 두지 않는다 — 데이터가 없으면 빈 상태로 표시한다.
const EMPTY_CATEGORY: Category = {
  id: 'etc',
  label: '기타',
  description: '',
  phone: '',
  hours: '',
  order: 999,
}

export const getCategory = (id: CategoryId, categories: Category[]): Category =>
  categories.find((category) => category.id === id) ??
  categories.find((category) => category.id === 'etc') ??
  categories[0] ??
  EMPTY_CATEGORY
