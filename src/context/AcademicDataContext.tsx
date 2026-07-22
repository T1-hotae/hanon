import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  createChatInquiry,
  getCategories,
  getChecklists,
  getFaqEntries,
  getInitialInquiries,
  getInitialNotices,
  getKeywordPresets,
  isFirestoreConfigured,
} from '../services/inquiryService'
import { ensureAnonymousAuth } from '../services/chatService'
import { AcademicDataContext, type AcademicDataValue } from './academicDataContextObject'
import type {
  Category,
  Checklist,
  FaqEntry,
  Inquiry,
  Notice,
  PresetQuestion,
} from '../types/academic'

export const AcademicDataProvider = ({ children }: { children: ReactNode }) => {
  const [categories, setCategories] = useState<Category[]>([])
  const [keywordPresets, setKeywordPresets] = useState<PresetQuestion[]>([])
  const [faqEntries, setFaqEntries] = useState<FaqEntry[]>([])
  const [checklists, setChecklists] = useState<Checklist[]>([])
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 익명 로그인(FAQ 조회수 갱신·채팅에 필요). 실패해도 읽기는 그대로 동작.
    void ensureAnonymousAuth()

    Promise.all([
      getCategories(),
      getKeywordPresets(),
      getFaqEntries(),
      getChecklists(),
      getInitialInquiries(),
      getInitialNotices(),
    ])
      .then(([
        initialCategories,
        initialPresets,
        initialFaqEntries,
        initialChecklists,
        initialInquiries,
        initialNotices,
      ]) => {
        setCategories(initialCategories)
        setKeywordPresets(initialPresets)
        setFaqEntries(initialFaqEntries)
        setChecklists(initialChecklists)
        setInquiries(initialInquiries)
        setNotices(initialNotices)
      })
      .finally(() => setLoading(false))
  }, [])

  const value = useMemo<AcademicDataValue>(
    () => ({
      categories,
      keywordPresets,
      faqEntries,
      checklists,
      inquiries,
      notices,
      loading,
      usingMockData: !isFirestoreConfigured(),
      addChatInquiry: async (category, questionText, detail) => {
        const inquiry = await createChatInquiry(category, questionText, detail)
        setInquiries((current) => [inquiry, ...current])
      },
    }),
    [categories, checklists, faqEntries, inquiries, keywordPresets, loading, notices],
  )

  return (
    <AcademicDataContext.Provider value={value}>
      {children}
    </AcademicDataContext.Provider>
  )
}
