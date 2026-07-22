import type { CategoryId } from './types/academic'

export const primaryTabs: { id: CategoryId; label: string }[] = [
  { id: 'transfer', label: '전과' },
  { id: 'course', label: '수강신청' },
  { id: 'leave', label: '휴학' },
]
