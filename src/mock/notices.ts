import type { Notice } from '../types/academic'

const day = (value: string) => new Date(`${value}T09:00:00+09:00`).getTime()

export const mockNotices: Notice[] = [
  { id: 'n-transfer-1', category: 'transfer', title: '2026학년도 2학기 전과 신청 안내', url: 'https://example.edu/notices/transfer-2026-fall', postedAt: day('2026-07-15'), order: 1, viewCount: 312 },
  { id: 'n-transfer-2', category: 'transfer', title: '전과 지원 자격 및 선발 기준 공지', url: 'https://example.edu/notices/transfer-eligibility', postedAt: day('2026-07-08'), order: 2, viewCount: 208 },
  { id: 'n-transfer-3', category: 'transfer', title: '전과 신청 제출서류 및 온라인 접수 방법 안내', url: 'https://example.edu/notices/transfer-documents', postedAt: day('2026-06-30'), order: 3, viewCount: 145 },
  { id: 'n-transfer-4', category: 'transfer', title: '전과 합격자 학점 인정 안내', url: 'https://example.edu/notices/transfer-credit', postedAt: day('2026-06-24'), order: 4, viewCount: 91 },

  { id: 'n-course-1', category: 'course', title: '2026학년도 2학기 예비수강신청 일정 안내', url: 'https://example.edu/notices/course-pre', postedAt: day('2026-07-18'), order: 1, viewCount: 401 },
  { id: 'n-course-2', category: 'course', title: '2026학년도 2학기 본수강신청 일정 공지', url: 'https://example.edu/notices/course-main', postedAt: day('2026-07-14'), order: 2, viewCount: 356 },
  { id: 'n-course-3', category: 'course', title: '수강신청 정정 및 철회 기간 안내', url: 'https://example.edu/notices/course-correction', postedAt: day('2026-07-12'), order: 3, viewCount: 189 },
  { id: 'n-course-4', category: 'course', title: '재수강 신청 가능 교과목 및 성적 제한 기준', url: 'https://example.edu/notices/course-retake', postedAt: day('2026-07-01'), order: 4, viewCount: 77 },

  { id: 'n-leave-1', category: 'leave', title: '2026학년도 2학기 일반휴학 및 복학 신청 안내', url: 'https://example.edu/notices/leave-return', postedAt: day('2026-07-16'), order: 1, viewCount: 267 },
  { id: 'n-leave-2', category: 'leave', title: '군휴학 신청 서류 제출 및 승인 절차 안내', url: 'https://example.edu/notices/leave-military', postedAt: day('2026-07-09'), order: 2, viewCount: 132 },
  { id: 'n-leave-3', category: 'leave', title: '질병휴학 진단서 제출 기준 변경 안내', url: 'https://example.edu/notices/leave-medical', postedAt: day('2026-07-03'), order: 3, viewCount: 98 },
  { id: 'n-leave-4', category: 'leave', title: '휴학 가능 학기 수 및 연장 신청 유의사항', url: 'https://example.edu/notices/leave-limit', postedAt: day('2026-06-27'), order: 4, viewCount: 64 },

  { id: 'n-etc-1', category: 'etc', title: '2026학년도 2학기 국가장학금 2차 신청 안내', url: 'https://example.edu/notices/scholarship', postedAt: day('2026-07-17'), order: 1, viewCount: 224 },
  { id: 'n-etc-2', category: 'etc', title: '하계 계절학기 성적 정정 기간 안내', url: 'https://example.edu/notices/summer-grade', postedAt: day('2026-07-12'), order: 2, viewCount: 156 },
  { id: 'n-etc-3', category: 'etc', title: '2026년 8월 졸업예정자 학위수여 요건 확인 안내', url: 'https://example.edu/notices/graduation', postedAt: day('2026-07-05'), order: 3, viewCount: 88 },
  { id: 'n-etc-4', category: 'etc', title: '2학기 등록금 납부 기간 및 분할납부 신청 안내', url: 'https://example.edu/notices/tuition', postedAt: day('2026-06-28'), order: 4, viewCount: 61 },
]
