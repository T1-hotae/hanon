import { createContext } from 'react'
import type {
  Category,
  Checklist,
  Contact,
  FaqEntry,
  Notice,
} from '../types/academic'

export type AcademicDataValue = {
  categories: Category[]
  faqEntries: FaqEntry[]
  checklists: Checklist[]
  contacts: Contact[]
  notices: Notice[]
  loading: boolean
  firebaseUnavailable: boolean
}

export const AcademicDataContext = createContext<AcademicDataValue | undefined>(
  undefined,
)
