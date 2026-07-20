import type { CategoryId, Inquiry } from '../types/academic'

const day = (value: string) => new Date(`${value}T10:00:00+09:00`).getTime()

const answers: Record<string, { answer: string; notices: string[] }> = {
  '전과 지원 자격이 뭔가요': {
    answer: '직전 학기까지 정해진 학점을 이수하고 학칙상 제한 사유가 없어야 합니다. 학과별 선발 기준이 다르므로 모집 공고의 지원 자격 표를 반드시 확인하세요.',
    notices: ['n-transfer-1', 'n-transfer-2'],
  },
  '전과 신청 기간이 언제인가요': {
    answer: '2026학년도 2학기 전과 신청은 2026년 7월 22일부터 7월 26일까지 학사포털에서 접수합니다.',
    notices: ['n-transfer-1'],
  },
  '제출 서류가 뭔가요': {
    answer: '전과 신청서, 성적증명서, 학업계획서를 기본으로 제출하며 학과별 추가 서류가 있을 수 있습니다.',
    notices: ['n-transfer-3'],
  },
  '전과 후 학점 인정되나요': {
    answer: '전과 후 기존 이수 교과목은 새 학과의 교육과정 기준에 따라 전공, 일반선택 등으로 재분류됩니다.',
    notices: ['n-transfer-4'],
  },
  '수강 가능 인원이 몇 명인가요': {
    answer: '수강 가능 인원은 강좌별로 다르며 예비수강신청 결과와 강의실 사정에 따라 일부 조정될 수 있습니다.',
    notices: ['n-course-1', 'n-course-5'],
  },
  '예비수강신청과 본수강신청 차이가 뭔가요': {
    answer: '예비수강신청은 수요 조사 성격이며 실제 수강 확정은 본수강신청 기간에 선착순 또는 학년별 일정에 따라 진행됩니다.',
    notices: ['n-course-1', 'n-course-2'],
  },
  '정정 기간이 언제인가요': {
    answer: '2026학년도 2학기 수강 정정 기간은 개강 첫 주에 운영되며, 정확한 날짜는 학사 공지의 정정 기간 안내를 확인하세요.',
    notices: ['n-course-3'],
  },
  '재수강 조건이 뭔가요': {
    answer: '재수강은 기존 취득 성적과 교과목 동일성 기준을 충족해야 하며, 재수강 후 취득 가능 성적에 제한이 있을 수 있습니다.',
    notices: ['n-course-4'],
  },
  '휴학 신청 기간이 언제인가요': {
    answer: '2026학년도 2학기 휴학 신청은 2026년 7월 29일부터 학사포털에서 가능하며 종류별 마감일이 다릅니다.',
    notices: ['n-leave-1'],
  },
  '일반휴학 최대 몇 학기 가능한가요': {
    answer: '일반휴학 가능 학기는 학칙상 총 허용 학기 수 안에서 신청할 수 있으며, 연장 신청 시 누적 학기를 확인해야 합니다.',
    notices: ['n-leave-4'],
  },
  '군휴학 서류가 뭔가요': {
    answer: '군휴학은 입영통지서 또는 복무확인서 등 병역 사실을 확인할 수 있는 서류를 제출해야 합니다.',
    notices: ['n-leave-2'],
  },
  '등록금을 낸 뒤 휴학하면 어떻게 되나요': {
    answer: '등록 후 휴학 승인 시 등록금은 복학 학기로 이월되는 것이 원칙이나 신청 시점에 따라 처리 기준이 다를 수 있습니다.',
    notices: ['n-leave-5'],
  },
  '성적 정정 기간이 언제인가요': {
    answer: '하계 계절학기 성적 정정은 2026년 7월 12일 공지된 기간 안에 담당 교원 확인 후 처리됩니다.',
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
  makeInquiry('i-001', 'transfer', '전과 지원 자격이 뭔가요', 'chat', 'answered', '2026-07-19'),
  makeInquiry('i-002', 'transfer', '전과 지원 자격이 뭔가요', 'phone', 'answered', '2026-07-18'),
  makeInquiry('i-003', 'transfer', '전과 지원 자격이 뭔가요', 'chat', 'answered', '2026-07-17'),
  makeInquiry('i-004', 'transfer', '전과 지원 자격이 뭔가요', 'phone', 'pending', '2026-07-16'),
  makeInquiry('i-005', 'transfer', '전과 신청 기간이 언제인가요', 'phone', 'answered', '2026-07-18'),
  makeInquiry('i-006', 'transfer', '전과 신청 기간이 언제인가요', 'chat', 'answered', '2026-07-17'),
  makeInquiry('i-007', 'transfer', '전과 신청 기간이 언제인가요', 'phone', 'pending', '2026-07-15'),
  makeInquiry('i-008', 'transfer', '제출 서류가 뭔가요', 'chat', 'answered', '2026-07-14'),
  makeInquiry('i-009', 'transfer', '제출 서류가 뭔가요', 'phone', 'pending', '2026-07-13'),
  makeInquiry('i-010', 'transfer', '전과 후 학점 인정되나요', 'chat', 'answered', '2026-07-12'),
  makeInquiry('i-011', 'transfer', '복수전공과 전과 차이가 뭔가요', 'phone', 'pending', '2026-07-11'),

  makeInquiry('i-012', 'course', '수강 가능 인원이 몇 명인가요', 'chat', 'answered', '2026-07-19'),
  makeInquiry('i-013', 'course', '수강 가능 인원이 몇 명인가요', 'phone', 'answered', '2026-07-18'),
  makeInquiry('i-014', 'course', '수강 가능 인원이 몇 명인가요', 'phone', 'answered', '2026-07-17'),
  makeInquiry('i-015', 'course', '수강 가능 인원이 몇 명인가요', 'chat', 'pending', '2026-07-16'),
  makeInquiry('i-016', 'course', '예비수강신청과 본수강신청 차이가 뭔가요', 'chat', 'answered', '2026-07-15'),
  makeInquiry('i-017', 'course', '예비수강신청과 본수강신청 차이가 뭔가요', 'phone', 'answered', '2026-07-14'),
  makeInquiry('i-018', 'course', '정정 기간이 언제인가요', 'phone', 'answered', '2026-07-13'),
  makeInquiry('i-019', 'course', '정정 기간이 언제인가요', 'chat', 'pending', '2026-07-12'),
  makeInquiry('i-020', 'course', '재수강 조건이 뭔가요', 'chat', 'answered', '2026-07-11'),
  makeInquiry('i-021', 'course', '타 학과 전공 수업을 들을 수 있나요', 'phone', 'pending', '2026-07-10'),
  makeInquiry('i-022', 'course', '수강신청 실패하면 증원 신청이 가능한가요', 'phone', 'pending', '2026-07-09'),

  makeInquiry('i-023', 'leave', '휴학 신청 기간이 언제인가요', 'phone', 'answered', '2026-07-19'),
  makeInquiry('i-024', 'leave', '휴학 신청 기간이 언제인가요', 'chat', 'answered', '2026-07-18'),
  makeInquiry('i-025', 'leave', '휴학 신청 기간이 언제인가요', 'phone', 'pending', '2026-07-17'),
  makeInquiry('i-026', 'leave', '일반휴학 최대 몇 학기 가능한가요', 'chat', 'answered', '2026-07-16'),
  makeInquiry('i-027', 'leave', '일반휴학 최대 몇 학기 가능한가요', 'phone', 'answered', '2026-07-15'),
  makeInquiry('i-028', 'leave', '군휴학 서류가 뭔가요', 'phone', 'answered', '2026-07-14'),
  makeInquiry('i-029', 'leave', '군휴학 서류가 뭔가요', 'chat', 'pending', '2026-07-13'),
  makeInquiry('i-030', 'leave', '등록금을 낸 뒤 휴학하면 어떻게 되나요', 'chat', 'answered', '2026-07-12'),
  makeInquiry('i-031', 'leave', '질병휴학은 어떤 서류가 필요한가요', 'phone', 'pending', '2026-07-11'),
  makeInquiry('i-032', 'leave', '복학 신청은 어디에서 하나요', 'chat', 'pending', '2026-07-10'),

  makeInquiry('i-033', 'etc', '성적 정정 기간이 언제인가요', 'chat', 'answered', '2026-07-19'),
  makeInquiry('i-034', 'etc', '성적 정정 기간이 언제인가요', 'phone', 'answered', '2026-07-18'),
  makeInquiry('i-035', 'etc', '등록금 납부 기간이 언제인가요', 'phone', 'pending', '2026-07-17'),
  makeInquiry('i-036', 'etc', '졸업요건은 어디서 확인하나요', 'chat', 'pending', '2026-07-16'),
  makeInquiry('i-037', 'etc', '장학금 신청은 어디에서 하나요', 'phone', 'pending', '2026-07-15'),
  makeInquiry('i-038', 'etc', '학적부 정보를 수정하려면 어떻게 하나요', 'chat', 'pending', '2026-07-14'),
  makeInquiry('i-039', 'transfer', '전과 면접은 어떻게 진행되나요', 'phone', 'pending', '2026-07-13'),
  makeInquiry('i-040', 'course', '정정 기간이 언제인가요', 'phone', 'answered', '2026-07-12'),
  makeInquiry('i-041', 'leave', '휴학 신청 기간이 언제인가요', 'chat', 'answered', '2026-07-11'),
  makeInquiry('i-042', 'course', '재수강 조건이 뭔가요', 'phone', 'answered', '2026-07-10'),
]
