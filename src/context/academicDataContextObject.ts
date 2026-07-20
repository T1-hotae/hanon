import { createContext } from 'react'
import type { CategoryId, Inquiry, Notice } from '../types/academic'

export type AcademicDataValue = {
  inquiries: Inquiry[]
  notices: Notice[]
  loading: boolean
  usingMockData: boolean
  addPhoneInquiry: (category: CategoryId, questionText: string) => void
  answerInquiryGroup: (
    questionText: string,
    category: CategoryId,
    answerText: string,
    relatedNoticeIds: string[],
  ) => void
}

export const AcademicDataContext = createContext<AcademicDataValue | undefined>(
  undefined,
)
