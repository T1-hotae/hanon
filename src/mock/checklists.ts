import type { Checklist } from '../types/academic'

export const mockChecklists: Checklist[] = [
  {
    id: 'checklist-transfer',
    category: 'transfer',
    order: 1,
    items: [
      { id: 'status', label: '현재 상태', content: '신청 예정', order: 1 },
      { id: 'period', label: '신청 기간', content: '2026.7.20. ~ 7.31.', order: 2 },
      { id: 'eligibility', label: '지원 자격', content: '2학년 이상, 최소 35학점 이수', order: 3 },
      { id: 'documents', label: '필요 서류', content: '전과 신청서, 학업계획서, 성적증명서', order: 4 },
      { id: 'route', label: '신청 경로', content: '종합정보시스템 → 학적 → 전과 신청', order: 5 },
    ],
  },
  {
    id: 'checklist-course',
    category: 'course',
    order: 2,
    items: [
      { id: 'status', label: '현재 상태', content: '신청 예정', order: 1 },
      { id: 'period', label: '신청 기간', content: '예비수강 2026.8.10. ~ 8.14., 본수강 정정 2026.8.31. ~ 9.4.', order: 2 },
      { id: 'eligibility', label: '지원 자격', content: '재학생 전체, 재수강은 직전 학기 성적 D+ 이하', order: 3 },
      { id: 'documents', label: '필요 서류', content: '별도 서류 없음(재수강 승인 필요 시 재수강 신청서)', order: 4 },
      { id: 'route', label: '신청 경로', content: '종합정보시스템 → 수강신청 → 강의 검색·신청', order: 5 },
    ],
  },
  {
    id: 'checklist-leave',
    category: 'leave',
    order: 3,
    items: [
      { id: 'status', label: '현재 상태', content: '신청 접수 중', order: 1 },
      { id: 'period', label: '신청 기간', content: '학기 개시일 기준 4주 이내', order: 2 },
      { id: 'eligibility', label: '지원 자격', content: '재학생 전체(군휴학은 입영일자 확인 필요)', order: 3 },
      { id: 'documents', label: '필요 서류', content: '휴학원, 병역 관련 서류(군휴학 시)', order: 4 },
      { id: 'route', label: '신청 경로', content: '종합정보시스템 → 학적 → 휴학 신청', order: 5 },
    ],
  },
  {
    id: 'checklist-etc',
    category: 'etc',
    order: 4,
    items: [
      { id: 'status', label: '현재 상태', content: '학사일정에 따라 상이', order: 1 },
      { id: 'period', label: '신청 기간', content: '학사일정 공지 참고', order: 2 },
      { id: 'eligibility', label: '지원 자격', content: '해당 공지의 대상자 요건 확인', order: 3 },
      { id: 'documents', label: '필요 서류', content: '해당 부서 안내 서류 준비', order: 4 },
      { id: 'route', label: '신청 경로', content: '종합정보시스템 또는 해당 부서 방문·전화 문의', order: 5 },
    ],
  },
]
