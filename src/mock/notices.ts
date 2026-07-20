import type { Notice } from '../types/academic'

const day = (value: string) => new Date(`${value}T09:00:00+09:00`).getTime()

export const mockNotices: Notice[] = [
  { id: 'n-transfer-1', category: 'transfer', title: '2026학년도 2학기 전부전과 신청 안내', url: 'https://example.edu/notices/transfer-2026-fall', postedAt: day('2026-07-15') },
  { id: 'n-transfer-2', category: 'transfer', title: '2026학년도 전과 지원 자격 및 선발 기준 공지', url: 'https://example.edu/notices/transfer-eligibility', postedAt: day('2026-07-08') },
  { id: 'n-transfer-3', category: 'transfer', title: '전과 신청 제출서류 및 온라인 접수 방법 안내', url: 'https://example.edu/notices/transfer-documents', postedAt: day('2026-06-30') },
  { id: 'n-transfer-4', category: 'transfer', title: '전과 합격자 학점 인정 및 이수구분 변경 안내', url: 'https://example.edu/notices/transfer-credit', postedAt: day('2026-06-24') },
  { id: 'n-transfer-5', category: 'transfer', title: '복수전공 신청자 전과 신청 유의사항', url: 'https://example.edu/notices/transfer-double-major', postedAt: day('2026-06-12') },
  { id: 'n-transfer-6', category: 'transfer', title: '전부전과 면접 일정 및 학과별 심사 장소 안내', url: 'https://example.edu/notices/transfer-interview', postedAt: day('2026-05-29') },

  { id: 'n-course-1', category: 'course', title: '2026학년도 2학기 예비수강신청 일정 안내', url: 'https://example.edu/notices/course-pre', postedAt: day('2026-07-18') },
  { id: 'n-course-2', category: 'course', title: '2026학년도 2학기 본수강신청 학년별 일정 공지', url: 'https://example.edu/notices/course-main', postedAt: day('2026-07-14') },
  { id: 'n-course-3', category: 'course', title: '수강신청 정정 및 철회 기간 안내', url: 'https://example.edu/notices/course-correction', postedAt: day('2026-07-12') },
  { id: 'n-course-4', category: 'course', title: '재수강 신청 가능 교과목 및 성적 제한 기준', url: 'https://example.edu/notices/course-retake', postedAt: day('2026-07-01') },
  { id: 'n-course-5', category: 'course', title: '교양 필수 교과목 수강 인원 증원 안내', url: 'https://example.edu/notices/course-capacity', postedAt: day('2026-06-26') },
  { id: 'n-course-6', category: 'course', title: '타 학과 전공 교과목 수강 제한 및 승인 절차', url: 'https://example.edu/notices/course-cross-major', postedAt: day('2026-06-18') },

  { id: 'n-leave-1', category: 'leave', title: '2026학년도 2학기 일반휴학 및 복학 신청 안내', url: 'https://example.edu/notices/leave-return', postedAt: day('2026-07-16') },
  { id: 'n-leave-2', category: 'leave', title: '군휴학 신청 서류 제출 및 승인 절차 안내', url: 'https://example.edu/notices/leave-military', postedAt: day('2026-07-09') },
  { id: 'n-leave-3', category: 'leave', title: '질병휴학 진단서 제출 기준 변경 안내', url: 'https://example.edu/notices/leave-medical', postedAt: day('2026-07-03') },
  { id: 'n-leave-4', category: 'leave', title: '휴학 가능 학기 수 및 연장 신청 유의사항', url: 'https://example.edu/notices/leave-limit', postedAt: day('2026-06-27') },
  { id: 'n-leave-5', category: 'leave', title: '등록 후 휴학 신청 시 등록금 이월 처리 안내', url: 'https://example.edu/notices/leave-tuition', postedAt: day('2026-06-19') },
  { id: 'n-leave-6', category: 'leave', title: '복학 예정자 수강신청 참여 방법 안내', url: 'https://example.edu/notices/return-course', postedAt: day('2026-06-08') },

  { id: 'n-etc-1', category: 'etc', title: '2026학년도 2학기 국가장학금 2차 신청 안내', url: 'https://example.edu/notices/scholarship', postedAt: day('2026-07-17') },
  { id: 'n-etc-2', category: 'etc', title: '하계 계절학기 성적 정정 기간 안내', url: 'https://example.edu/notices/summer-grade', postedAt: day('2026-07-12') },
  { id: 'n-etc-3', category: 'etc', title: '2026학년도 8월 졸업예정자 학위수여 요건 확인 안내', url: 'https://example.edu/notices/graduation', postedAt: day('2026-07-05') },
  { id: 'n-etc-4', category: 'etc', title: '2학기 등록금 납부 기간 및 분할납부 신청 안내', url: 'https://example.edu/notices/tuition', postedAt: day('2026-06-28') },
  { id: 'n-etc-5', category: 'etc', title: '학적부 개인정보 정정 신청 절차 안내', url: 'https://example.edu/notices/student-record', postedAt: day('2026-06-20') },
  { id: 'n-etc-6', category: 'etc', title: '교내 학사민원 통합 상담 창구 운영 안내', url: 'https://example.edu/notices/helpdesk', postedAt: day('2026-06-11') },
  { id: 'n-etc-7', category: 'etc', title: '학사일정 변경에 따른 주요 행정 처리 기한 안내', url: 'https://example.edu/notices/calendar-change', postedAt: day('2026-06-04') },
]
