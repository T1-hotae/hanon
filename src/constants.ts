import type { Category } from './types/academic'

// 홈/카테고리 상단 탭에 노출할 카테고리 목록.
// 관리자 앱에서 추가한 카테고리가 자동 반영되며, 예약어 'etc'(기타)는 탭에서 제외하고 order 순으로 정렬한다.
export const primaryCategories = (categories: Category[]): Category[] =>
  categories
    .filter((category) => category.id !== 'etc')
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
