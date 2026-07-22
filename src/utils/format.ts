import type { FaqEntry, Notice } from '../types/academic'

// 원문 공지 목록에는 YY.MM.DD 형태로 간결하게 표기한다(예: 26.07.04).
export const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  const year = String(date.getFullYear()).slice(2)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

export const sortFaqs = (faqs: FaqEntry[]) =>
  [...faqs].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    if (b.viewCount !== a.viewCount) return b.viewCount - a.viewCount
    return a.order - b.order
  })

export const sortNoticesByViews = (notices: Notice[]) =>
  [...notices].sort((a, b) => {
    if (b.viewCount !== a.viewCount) return b.viewCount - a.viewCount
    if (a.order !== b.order) return a.order - b.order
    return b.postedAt - a.postedAt
  })

// 세션당 한 번만 조회수를 올린다(중복 카운트 방지).
const markViewedOnce = (storageKey: string, id: string): boolean => {
  try {
    const raw = sessionStorage.getItem(storageKey)
    const viewed = new Set<string>(raw ? JSON.parse(raw) : [])
    if (viewed.has(id)) return false
    viewed.add(id)
    sessionStorage.setItem(storageKey, JSON.stringify([...viewed]))
    return true
  } catch {
    return true
  }
}

export const markFaqViewedOnce = (faqId: string): boolean => markViewedOnce('hannon-faq-viewed', faqId)

export const markNoticeViewedOnce = (noticeId: string): boolean =>
  markViewedOnce('hannon-notice-viewed', noticeId)

export const formatViews = (count: number) => `조회 ${count.toLocaleString('ko-KR')}`
