import type { Category, CategoryId } from './types/academic'

// 홈/카테고리 상단 탭에 노출할 카테고리 목록.
// 관리자 앱에서 추가한 카테고리가 자동 반영되며, 예약어 'etc'(기타)는 탭에서 제외하고 order 순으로 정렬한다.
export const primaryCategories = (categories: Category[]): Category[] =>
  categories
    .filter((category) => category.id !== 'etc')
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

// 카테고리 label 안에 특정 키워드가 있으면 함께 인식할 동의어를 붙여 준다(재현율 보강).
// 카테고리는 Firestore에서 동적으로 오므로, 기본 인식은 label 자체 토큰으로 하고 아래는 보조용이다.
const SYNONYMS: { key: string; words: string[] }[] = [
  { key: '전과', words: ['전과', '전부전과', '전공변경', '전공 변경', '학과변경', '학과 변경'] },
  { key: '수강', words: ['수강', '수강신청', '강의신청', '과목신청', '수강정정', '수강 정정', '정정'] },
  { key: '휴학', words: ['휴학', '휴학원', '군휴학', '일반휴학'] },
  { key: '복학', words: ['복학', '복학신청', '복귀'] },
  { key: '장학', words: ['장학', '장학금', '장학생', '학자금', '성적장학'] },
  { key: '졸업', words: ['졸업', '졸업요건', '졸업사정', '학위'] },
]

// 한글/영문/숫자 2글자 이상 토큰만 추출
const tokenize = (text: string): string[] =>
  text
    .split(/[^가-힣a-zA-Z0-9]+/)
    .map((token) => token.trim().toLowerCase())
    .filter((token) => token.length >= 2)

// 질문 문장에서 가장 관련 있는 카테고리를 키워드로 추정한다.
// 매칭되는 키워드가 없으면 undefined(→ 호출부에서 '기타'로 폴백).
export const detectCategory = (query: string, categories: Category[]): CategoryId | undefined => {
  const q = query.toLowerCase()
  let bestId: CategoryId | undefined
  let bestScore = 0

  for (const category of categories) {
    if (category.id === 'etc') continue

    const keywords = new Set<string>()
    tokenize(category.label).forEach((token) => keywords.add(token))
    for (const { key, words } of SYNONYMS) {
      if (category.label.includes(key)) words.forEach((word) => keywords.add(word.toLowerCase()))
    }

    let score = 0
    for (const keyword of keywords) {
      // 공백 제거본에서도 확인(예: "수강 신청" ↔ "수강신청")
      if (q.includes(keyword) || q.replace(/\s+/g, '').includes(keyword.replace(/\s+/g, ''))) {
        score += keyword.length // 더 긴(구체적인) 키워드일수록 가중
      }
    }

    if (score > bestScore) {
      bestScore = score
      bestId = category.id
    }
  }

  return bestScore > 0 ? bestId : undefined
}
