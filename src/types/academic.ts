export type CategoryId = 'transfer' | 'course' | 'leave' | 'etc'

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
}

export type PresetQuestion = {
  id: string
  category: CategoryId
  text: string
  order?: number
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
  category: CategoryId
  status: 'open' | 'answered'
  lastMessage: string
  lastMessageAt: number
  createdAt: number
  unreadForAdmin: boolean
  unreadForStudent: boolean
  needsHuman: boolean
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

export const CATEGORIES: Category[] = [
  {
    id: 'transfer',
    label: '전과',
    description: '전과 자격, 신청 기간, 제출 서류, 학점 인정 안내',
    phone: '02-320-1081',
    hours: '평일 09:00-17:00, 점심시간 12:00-13:00 제외',
    order: 1,
  },
  {
    id: 'course',
    label: '수강신청',
    description: '예비수강, 본수강 정정 기간, 재수강 기준 안내',
    phone: '02-320-1082',
    hours: '평일 09:00-17:00, 수강신청 기간 연장 운영',
    order: 2,
  },
  {
    id: 'leave',
    label: '휴학',
    description: '일반휴학, 군휴학, 복학, 신청 서류 안내',
    phone: '02-320-1083',
    hours: '평일 09:00-17:00, 점심시간 12:00-13:00 제외',
    order: 3,
  },
  {
    id: 'etc',
    label: '기타',
    description: '입학, 성적, 졸업, 등록 등 기타 학사 공지 확인',
    phone: '02-320-1000',
    hours: '평일 09:00-17:00, 해당 부서 연결',
    order: 4,
  },
]

export const getCategory = (id: CategoryId, categories: Category[] = CATEGORIES) =>
  categories.find((category) => category.id === id) ??
  categories.find((category) => category.id === 'etc') ??
  CATEGORIES[3]
