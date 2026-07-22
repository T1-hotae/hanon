import admin from 'firebase-admin'

const projectId = process.env.FIREBASE_PROJECT_ID

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId,
  })
}

const db = admin.firestore()

const categories = [
  { id: 'transfer', label: '전과', description: '전과 자격, 신청 기간, 제출 서류, 학점 인정 안내', phone: '02-320-1081', hours: '평일 09:00-17:00, 점심시간 12:00-13:00 제외', order: 1 },
  { id: 'course', label: '수강신청', description: '예비수강, 본수강 정정 기간, 재수강 기준 안내', phone: '02-320-1082', hours: '평일 09:00-17:00, 수강신청 기간 연장 운영', order: 2 },
  { id: 'leave', label: '휴학', description: '일반휴학, 군휴학, 복학, 신청 서류 안내', phone: '02-320-1083', hours: '평일 09:00-17:00, 점심시간 12:00-13:00 제외', order: 3 },
  { id: 'etc', label: '기타', description: '입학, 성적, 졸업, 등록 등 기타 학사 공지 확인', phone: '02-320-1000', hours: '평일 09:00-17:00, 해당 부서 연결', order: 4 },
]

const keywordPresets = [
  ['transfer', ['전과 지원 자격이 어떻게 되나요?', '전과 신청 기간은 언제인가요?', '전과 신청 제출 서류가 무엇인가요?', '전과 후 학점은 어떻게 인정되나요?']],
  ['course', ['예비수강신청과 본수강신청의 차이가 무엇인가요?', '수강 정정 기간은 언제인가요?', '재수강 조건이 무엇인가요?', '타 학과 전공 수업을 들을 수 있나요?']],
  ['leave', ['휴학 신청 기간은 언제인가요?', '일반휴학은 최대 몇 학기 가능한가요?', '군휴학 신청 서류가 무엇인가요?', '복학 신청은 어디에서 하나요?']],
  ['etc', ['성적 정정 기간은 언제인가요?', '등록금 납부 기간은 언제인가요?', '졸업요건은 어디서 확인하나요?', '장학금 신청은 어디서 하나요?']],
].flatMap(([categoryId, labels]) =>
  labels.map((label, index) => ({
    id: `preset-${categoryId}-${index + 1}`,
    categoryId,
    label,
    order: index + 1,
  })),
)

const checklistItemsByCategory = {
  transfer: [
    { id: 'status', label: '현재 상태', content: '신청 예정', order: 1 },
    { id: 'period', label: '신청 기간', content: '2026.7.20. ~ 7.31.', order: 2 },
    { id: 'eligibility', label: '지원 자격', content: '2학년 이상, 최소 35학점 이수', order: 3 },
    { id: 'documents', label: '필요 서류', content: '전과 신청서, 학업계획서, 성적증명서', order: 4 },
    { id: 'route', label: '신청 경로', content: '종합정보시스템 → 학적 → 전과 신청', order: 5 },
  ],
  course: [
    { id: 'status', label: '현재 상태', content: '신청 예정', order: 1 },
    { id: 'period', label: '신청 기간', content: '예비수강 2026.8.10. ~ 8.14., 본수강 정정 2026.8.31. ~ 9.4.', order: 2 },
    { id: 'eligibility', label: '지원 자격', content: '재학생 전체, 재수강은 직전 학기 성적 D+ 이하', order: 3 },
    { id: 'documents', label: '필요 서류', content: '별도 서류 없음(재수강 승인 필요 시 재수강 신청서)', order: 4 },
    { id: 'route', label: '신청 경로', content: '종합정보시스템 → 수강신청 → 강의 검색·신청', order: 5 },
  ],
  leave: [
    { id: 'status', label: '현재 상태', content: '신청 접수 중', order: 1 },
    { id: 'period', label: '신청 기간', content: '학기 개시일 기준 4주 이내', order: 2 },
    { id: 'eligibility', label: '지원 자격', content: '재학생 전체(군휴학은 입영일자 확인 필요)', order: 3 },
    { id: 'documents', label: '필요 서류', content: '휴학원, 병역 관련 서류(군휴학 시)', order: 4 },
    { id: 'route', label: '신청 경로', content: '종합정보시스템 → 학적 → 휴학 신청', order: 5 },
  ],
  etc: [
    { id: 'status', label: '현재 상태', content: '학사일정에 따라 상이', order: 1 },
    { id: 'period', label: '신청 기간', content: '학사일정 공지 참고', order: 2 },
    { id: 'eligibility', label: '지원 자격', content: '해당 공지의 대상자 요건 확인', order: 3 },
    { id: 'documents', label: '필요 서류', content: '해당 부서 안내 서류 준비', order: 4 },
    { id: 'route', label: '신청 경로', content: '종합정보시스템 또는 해당 부서 방문·전화 문의', order: 5 },
  ],
}

const checklists = categories.map((category) => ({
  id: `checklist-${category.id}`,
  categoryId: category.id,
  order: category.order,
  items: checklistItemsByCategory[category.id],
}))

const notices = [
  { id: 'n-transfer-1', categoryId: 'transfer', title: '2026학년도 2학기 전과 신청 안내', url: 'https://example.edu/notices/transfer-2026-fall', postedAt: new Date('2026-07-15T09:00:00+09:00'), order: 1 },
  { id: 'n-course-1', categoryId: 'course', title: '2026학년도 2학기 예비수강신청 일정 안내', url: 'https://example.edu/notices/course-pre', postedAt: new Date('2026-07-18T09:00:00+09:00'), order: 1 },
  { id: 'n-leave-1', categoryId: 'leave', title: '2026학년도 2학기 일반휴학 및 복학 신청 안내', url: 'https://example.edu/notices/leave-return', postedAt: new Date('2026-07-16T09:00:00+09:00'), order: 1 },
  { id: 'n-etc-1', categoryId: 'etc', title: '2026학년도 2학기 국가장학금 2차 신청 안내', url: 'https://example.edu/notices/scholarship', postedAt: new Date('2026-07-17T09:00:00+09:00'), order: 1 },
]

const faqEntries = [
  { id: 'faq-transfer-1', categoryId: 'transfer', question: '전과 지원 자격이 어떻게 되나요?', answer: '직전 학기까지 정해진 학점을 이수하고 학칙상 제한 사유가 없어야 합니다. 학과별 선발 기준이 다르므로 모집 공고의 지원 자격 표를 함께 확인하세요.', answerImageUrls: [], relatedNoticeIds: ['n-transfer-1'], order: 1, pinned: true },
  { id: 'faq-course-1', categoryId: 'course', question: '예비수강신청과 본수강신청의 차이가 무엇인가요?', answer: '예비수강신청은 수요 조사 성격이며 실제 수강 확정은 본수강신청 기간의 신청 결과에 따라 결정됩니다.', answerImageUrls: [], relatedNoticeIds: ['n-course-1'], order: 1, pinned: true },
  { id: 'faq-leave-1', categoryId: 'leave', question: '휴학 신청 기간은 언제인가요?', answer: '2026학년도 2학기 휴학 신청은 2026년 7월 29일부터 학사 포털에서 가능하며, 종류별 마감일이 다를 수 있습니다.', answerImageUrls: [], relatedNoticeIds: ['n-leave-1'], order: 1, pinned: true },
  { id: 'faq-etc-1', categoryId: 'etc', question: '성적 정정 기간은 언제인가요?', answer: '계절학기 성적 정정은 공지된 기간 안에 담당 교원 확인 후 처리됩니다. 정확한 일정은 성적 공지를 확인하세요.', answerImageUrls: [], relatedNoticeIds: ['n-etc-1'], order: 1, pinned: true },
]

const upsertAll = async (collectionName, rows) => {
  const batch = db.batch()
  rows.forEach((row) => {
    const { id, ...data } = row
    batch.set(db.collection(collectionName).doc(id), {
      ...data,
      id,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true })
  })
  await batch.commit()
  console.log(`Seeded ${collectionName}: ${rows.length}`)
}

await upsertAll('categories', categories)
await upsertAll('keywordPresets', keywordPresets)
await upsertAll('checklists', checklists)
await upsertAll('notices', notices)
await upsertAll('faqEntries', faqEntries)
