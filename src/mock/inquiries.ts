import type { CategoryId, Inquiry } from '../types/academic'

const day = (value: string) => new Date(`${value}T10:00:00+09:00`).getTime()

const answers: Record<string, { answer: string; notices: string[] }> = {
  '전과 지원 자격이 어떻게 되나요?': {
    answer: '직전 학기까지 정해진 학점을 이수하고 학칙상 제한 사유가 없어야 합니다. 학과별 선발 기준이 다르므로 모집 공고를 확인하세요.',
    notices: ['n-transfer-1', 'n-transfer-2'],
  },
  '전과 신청 기간은 언제인가요?': {
    answer: '2026학년도 2학기 전과 신청은 2026년 7월 22일부터 7월 26일까지 학사 포털에서 접수합니다.',
    notices: ['n-transfer-1'],
  },
  '예비수강신청과 본수강신청의 차이가 무엇인가요?': {
    answer: '예비수강신청은 수요 조사 성격이며 실제 수강 확정은 본수강신청 기간의 신청 결과에 따라 결정됩니다.',
    notices: ['n-course-1', 'n-course-2'],
  },
  '재수강 조건이 무엇인가요?': {
    answer: '재수강은 기존 취득 성적과 교과목 동일성 기준을 충족해야 하며, 재수강 가능 성적에는 제한이 있을 수 있습니다.',
    notices: ['n-course-4'],
  },
  '휴학 신청 기간은 언제인가요?': {
    answer: '2026학년도 2학기 휴학 신청은 2026년 7월 29일부터 학사 포털에서 가능하며, 종류별 마감일이 다를 수 있습니다.',
    notices: ['n-leave-1'],
  },
  '군휴학 신청 서류가 무엇인가요?': {
    answer: '군휴학은 입영통지서 또는 복무확인서처럼 병역 사실을 확인할 수 있는 서류를 제출해야 합니다.',
    notices: ['n-leave-2'],
  },
  '성적 정정 기간은 언제인가요?': {
    answer: '성적 정정은 공지된 기간 안에 담당 교원 확인 후 처리됩니다. 정확한 일정은 성적 공지를 확인하세요.',
    notices: ['n-etc-2'],
  },
}

const makeInquiry = (
  id: string,
  category: CategoryId,
  questionText: string,
  source: 'chat' | 'phone',
  status: 'pending' | 'answered',
  date: string,
): Inquiry => {
  const answered = status === 'answered' ? answers[questionText] : undefined
  return {
    id,
    category,
    questionText,
    source,
    status,
    createdAt: day(date),
    answerText: answered?.answer,
    relatedNoticeIds: answered?.notices,
    answeredAt: answered ? day('2026-07-19') : undefined,
  }
}

export const mockInquiries: Inquiry[] = [
  makeInquiry('i-001', 'transfer', '전과 지원 자격이 어떻게 되나요?', 'chat', 'answered', '2026-07-19'),
  makeInquiry('i-002', 'transfer', '전과 지원 자격이 어떻게 되나요?', 'phone', 'answered', '2026-07-18'),
  makeInquiry('i-003', 'transfer', '전과 신청 기간은 언제인가요?', 'chat', 'answered', '2026-07-17'),
  makeInquiry('i-004', 'transfer', '전과 신청 제출 서류가 무엇인가요?', 'phone', 'pending', '2026-07-16'),
  makeInquiry('i-005', 'course', '예비수강신청과 본수강신청의 차이가 무엇인가요?', 'chat', 'answered', '2026-07-19'),
  makeInquiry('i-006', 'course', '재수강 조건이 무엇인가요?', 'phone', 'answered', '2026-07-18'),
  makeInquiry('i-007', 'course', '수강 정정 기간은 언제인가요?', 'chat', 'pending', '2026-07-17'),
  makeInquiry('i-008', 'leave', '휴학 신청 기간은 언제인가요?', 'phone', 'answered', '2026-07-19'),
  makeInquiry('i-009', 'leave', '군휴학 신청 서류가 무엇인가요?', 'chat', 'answered', '2026-07-18'),
  makeInquiry('i-010', 'leave', '복학 신청은 어디에서 하나요?', 'phone', 'pending', '2026-07-17'),
  makeInquiry('i-011', 'etc', '성적 정정 기간은 언제인가요?', 'chat', 'answered', '2026-07-19'),
  makeInquiry('i-012', 'etc', '등록금 납부 기간은 언제인가요?', 'phone', 'pending', '2026-07-18'),
]
