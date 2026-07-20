import type { CategoryId, Inquiry } from '../types/academic'

export type InquiryGroup = {
  key: string
  category: CategoryId
  questionText: string
  total: number
  chat: number
  phone: number
  pending: number
  answered: number
  status: 'pending' | 'answered'
  representativeId: string
  answerText?: string
  relatedNoticeIds: string[]
}

export const groupInquiries = (
  inquiries: Inquiry[],
  category?: CategoryId | 'all',
) => {
  const groups = new Map<string, InquiryGroup>()

  inquiries
    .filter((inquiry) => category === undefined || category === 'all' || inquiry.category === category)
    .forEach((inquiry) => {
      const key = `${inquiry.category}:${inquiry.questionText}`
      const existing = groups.get(key)
      const next: InquiryGroup =
        existing ??
        {
          key,
          category: inquiry.category,
          questionText: inquiry.questionText,
          total: 0,
          chat: 0,
          phone: 0,
          pending: 0,
          answered: 0,
          status: 'pending',
          representativeId: inquiry.id,
          relatedNoticeIds: [],
        }

      next.total += 1
      next[inquiry.source] += 1
      next[inquiry.status] += 1
      if (inquiry.answerText) next.answerText = inquiry.answerText
      if (inquiry.relatedNoticeIds?.length) {
        next.relatedNoticeIds = Array.from(
          new Set([...next.relatedNoticeIds, ...inquiry.relatedNoticeIds]),
        )
      }
      next.status = next.pending > 0 ? 'pending' : 'answered'
      groups.set(key, next)
    })

  return Array.from(groups.values()).sort((a, b) => {
    if (a.status !== b.status) return a.status === 'pending' ? -1 : 1
    return b.total - a.total
  })
}

export const answeredFaqGroups = (
  inquiries: Inquiry[],
  category?: CategoryId | 'all',
) =>
  groupInquiries(inquiries, category)
    .filter((group) => group.answerText)
    .sort((a, b) => b.total - a.total)
