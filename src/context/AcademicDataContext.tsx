import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  createInquiry,
  createPhoneInquiry,
  getInitialInquiries,
  getInitialNotices,
  isFirestoreConfigured,
} from '../services/inquiryService'
import { AcademicDataContext, type AcademicDataValue } from './academicDataContextObject'
import type { Inquiry, Notice } from '../types/academic'

export const AcademicDataProvider = ({ children }: { children: ReactNode }) => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getInitialInquiries(), getInitialNotices()])
      .then(([initialInquiries, initialNotices]) => {
        setInquiries(initialInquiries)
        setNotices(initialNotices)
      })
      .finally(() => setLoading(false))
  }, [])

  const value = useMemo<AcademicDataValue>(
    () => ({
      inquiries,
      notices,
      loading,
      usingMockData: !isFirestoreConfigured(),
      addPhoneInquiry: (category, questionText) => {
        setInquiries((current) => [
          createPhoneInquiry(category, questionText),
          ...current,
        ])
      },
      addChatInquiry: (category, questionText, answer) => {
        setInquiries((current) => [
          createInquiry('chat', category, questionText, answer),
          ...current,
        ])
      },
      answerInquiryGroup: (
        questionText,
        category,
        answerText,
        relatedNoticeIds,
      ) => {
        const answeredAt = Date.now()
        setInquiries((current) =>
          current.map((inquiry) =>
            inquiry.category === category &&
            inquiry.questionText === questionText
              ? {
                  ...inquiry,
                  status: 'answered',
                  answerText,
                  relatedNoticeIds,
                  answeredAt,
                }
              : inquiry,
          ),
        )
      },
    }),
    [inquiries, loading, notices],
  )

  return (
    <AcademicDataContext.Provider value={value}>
      {children}
    </AcademicDataContext.Provider>
  )
}
