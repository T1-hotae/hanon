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
}

export type Category = {
  id: CategoryId
  label: string
  description: string
  phone: string
  hours: string
}

export const CATEGORIES: Category[] = [
  {
    id: 'transfer',
    label: '전부전과',
    description: '전과 자격, 신청 기간, 제출 서류, 학점 인정 안내',
    phone: '02-320-1081',
    hours: '평일 09:00-17:00, 점심시간 12:00-13:00 제외',
  },
  {
    id: 'course',
    label: '수강신청',
    description: '예비수강, 본수강, 정정 기간, 재수강 기준 안내',
    phone: '02-320-1082',
    hours: '평일 09:00-17:00, 수강신청 기간 연장 운영',
  },
  {
    id: 'leave',
    label: '휴학',
    description: '일반휴학, 군휴학, 복학, 신청 서류 안내',
    phone: '02-320-1083',
    hours: '평일 09:00-17:00, 점심시간 12:00-13:00 제외',
  },
  {
    id: 'etc',
    label: '기타',
    description: '장학, 성적, 졸업, 등록 등 기타 학사 공지 확인',
    phone: '02-320-1000',
    hours: '평일 09:00-17:00, 담당 부서 연결',
  },
]

export const getCategory = (id: CategoryId) =>
  CATEGORIES.find((category) => category.id === id) ?? CATEGORIES[3]
