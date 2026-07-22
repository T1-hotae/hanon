import type { PresetQuestion } from '../types/academic'

export const presetQuestions: PresetQuestion[] = [
  { id: 'pq-transfer-1', category: 'transfer', text: '전과 지원 자격이 어떻게 되나요?', order: 1 },
  { id: 'pq-transfer-2', category: 'transfer', text: '전과 신청 기간은 언제인가요?', order: 2 },
  { id: 'pq-transfer-3', category: 'transfer', text: '전과 신청 제출 서류가 무엇인가요?', order: 3 },
  { id: 'pq-transfer-4', category: 'transfer', text: '전과 후 학점은 어떻게 인정되나요?', order: 4 },
  { id: 'pq-transfer-5', category: 'transfer', text: '복수전공과 전과의 차이가 무엇인가요?', order: 5 },

  { id: 'pq-course-1', category: 'course', text: '수강 가능 인원은 몇 명인가요?', order: 1 },
  { id: 'pq-course-2', category: 'course', text: '예비수강신청과 본수강신청의 차이가 무엇인가요?', order: 2 },
  { id: 'pq-course-3', category: 'course', text: '수강 정정 기간은 언제인가요?', order: 3 },
  { id: 'pq-course-4', category: 'course', text: '재수강 조건이 무엇인가요?', order: 4 },
  { id: 'pq-course-5', category: 'course', text: '타 학과 전공 수업을 들을 수 있나요?', order: 5 },

  { id: 'pq-leave-1', category: 'leave', text: '휴학 신청 기간은 언제인가요?', order: 1 },
  { id: 'pq-leave-2', category: 'leave', text: '일반휴학은 최대 몇 학기 가능한가요?', order: 2 },
  { id: 'pq-leave-3', category: 'leave', text: '군휴학 신청 서류가 무엇인가요?', order: 3 },
  { id: 'pq-leave-4', category: 'leave', text: '등록금을 낸 뒤 휴학하면 어떻게 되나요?', order: 4 },
  { id: 'pq-leave-5', category: 'leave', text: '복학 신청은 어디에서 하나요?', order: 5 },

  { id: 'pq-etc-1', category: 'etc', text: '성적 정정 기간은 언제인가요?', order: 1 },
  { id: 'pq-etc-2', category: 'etc', text: '등록금 납부 기간은 언제인가요?', order: 2 },
  { id: 'pq-etc-3', category: 'etc', text: '졸업요건은 어디서 확인하나요?', order: 3 },
  { id: 'pq-etc-4', category: 'etc', text: '장학금 신청은 어디서 하나요?', order: 4 },
  { id: 'pq-etc-5', category: 'etc', text: '학적부 정보를 수정하려면 어떻게 하나요?', order: 5 },
]
