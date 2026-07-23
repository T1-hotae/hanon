import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  getCategories,
  getChecklists,
  getContacts,
  getFaqEntries,
  getInitialNotices,
  isFirestoreConfigured,
} from '../services/inquiryService'
import { ensureAnonymousAuth } from '../services/chatService'
import { AcademicDataContext, type AcademicDataValue } from './academicDataContextObject'
import type {
  Category,
  Checklist,
  Contact,
  FaqEntry,
  Notice,
} from '../types/academic'

export const AcademicDataProvider = ({ children }: { children: ReactNode }) => {
  const [categories, setCategories] = useState<Category[]>([])
  const [faqEntries, setFaqEntries] = useState<FaqEntry[]>([])
  const [checklists, setChecklists] = useState<Checklist[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 익명 로그인(FAQ 조회수 갱신·채팅에 필요). 실패해도 읽기는 그대로 동작.
    void ensureAnonymousAuth()

    Promise.all([
      getCategories(),
      getFaqEntries(),
      getChecklists(),
      getContacts(),
      getInitialNotices(),
    ])
      .then(([
        initialCategories,
        initialFaqEntries,
        initialChecklists,
        initialContacts,
        initialNotices,
      ]) => {
        setCategories(initialCategories)
        setFaqEntries(initialFaqEntries)
        setChecklists(initialChecklists)
        setContacts(initialContacts)
        setNotices(initialNotices)
      })
      .finally(() => setLoading(false))
  }, [])

  const value = useMemo<AcademicDataValue>(
    () => ({
      categories,
      faqEntries,
      checklists,
      contacts,
      notices,
      loading,
      firebaseUnavailable: !isFirestoreConfigured(),
    }),
    [categories, checklists, contacts, faqEntries, loading, notices],
  )

  return (
    <AcademicDataContext.Provider value={value}>
      {children}
    </AcademicDataContext.Provider>
  )
}
