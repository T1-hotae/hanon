import type { FaqEntry } from '../types/academic'

export const formatDate = (timestamp: number) =>
  new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(timestamp)
    .replaceAll('. ', '.')
    .replace('.', '')

export const sortFaqs = (faqs: FaqEntry[]) =>
  [...faqs].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    if (b.viewCount !== a.viewCount) return b.viewCount - a.viewCount
    return a.order - b.order
  })

const VIEWED_KEY = 'hannon-faq-viewed'

// 세션당 한 번만 조회수를 올린다(중복 카운트 방지).
export const markFaqViewedOnce = (faqId: string): boolean => {
  try {
    const raw = sessionStorage.getItem(VIEWED_KEY)
    const viewed = new Set<string>(raw ? JSON.parse(raw) : [])
    if (viewed.has(faqId)) return false
    viewed.add(faqId)
    sessionStorage.setItem(VIEWED_KEY, JSON.stringify([...viewed]))
    return true
  } catch {
    return true
  }
}

export const getViewCount = (id: string, base = 120) => {
  const seed = [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return base + (seed % 480)
}

export const formatViews = (count: number) => `조회 ${count.toLocaleString('ko-KR')}`
