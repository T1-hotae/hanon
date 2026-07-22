import { createContext } from 'react'
import type {
  Category,
  CategoryId,
  Checklist,
  FaqEntry,
  Inquiry,
  Notice,
  PresetQuestion,
} from '../types/academic'

export type AcademicDataValue = {
  categories: Category[]
  keywordPresets: PresetQuestion[]
  faqEntries: FaqEntry[]
  checklists: Checklist[]
  inquiries: Inquiry[]
  notices: Notice[]
  loading: boolean
  usingMockData: boolean
  addChatInquiry: (category: CategoryId, questionText: string, detail?: string) => Promise<void>
}

export const AcademicDataContext = createContext<AcademicDataValue | undefined>(
  undefined,
)
