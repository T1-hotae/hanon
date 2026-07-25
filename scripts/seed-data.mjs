// 학사 안내 seed 데이터(강남대 2026-2학기 통합안내 기준).
// admin SDK(seed.mjs)와 웹 SDK(seed-web.mjs)가 함께 사용한다.
// 순수 데이터만 export 한다 — updatedAt(serverTimestamp)은 각 스크립트에서 붙인다.

const day = (value) => new Date(`${value}T09:00:00+09:00`)

// 내선번호 → 실제로 걸 수 있는 전체 번호. (구내전화 안내 기준)
// 3XXX → 031-280-3XXX, 7XXX → 031-899-7XXX, 국번 포함 표기는 031- 보정.
const tel = (ext) => {
  const s = String(ext).trim()
  if (s.startsWith('0')) return s
  if (s.includes('-')) return `031-${s}`
  if (/^3\d{3}$/.test(s)) return `031-280-${s}`
  if (/^7\d{3}$/.test(s)) return `031-899-${s}`
  return s
}

// phone/hours는 예시값이다. 실제 학과·부서 번호로 관리자 앱에서 수정하세요.
export const categories = [
  { id: 'transfer', label: '전과', description: '전부·전과 자격, 신청 방법, 전과 전 확인사항 안내', phone: '02-320-1081', hours: '평일 09:00-17:00, 점심시간 12:00-13:00 제외', order: 1 },
  { id: 'course', label: '수강신청', description: '예비·본 수강신청 일정, 대기제, 전공세미나, 군 원격강좌 안내', phone: '02-320-1082', hours: '평일 09:00-17:00, 수강신청 기간 연장 운영', order: 2 },
  { id: 'leave', label: '휴학', description: '일반·질병·입대 등 휴학 종류와 복학 신청 안내', phone: '02-320-1083', hours: '평일 09:00-17:00, 점심시간 12:00-13:00 제외', order: 3 },
  { id: 'etc', label: '기타', description: '입학, 성적, 졸업, 등록 등 기타 학사 공지 확인', phone: '02-320-1000', hours: '평일 09:00-17:00, 해당 부서 연결', order: 4 },
]

const checklistItemsByCategory = {
  transfer: [
    { id: 'eligibility', label: '신청 자격', content: '2학기 이상 이수 · 다음 학기가 3~6번째 학기 · 총 취득 평균평점 2.5 이상', order: 1 },
    { id: 'return-first', label: '휴학 중이라면', content: '다음 학기 복학 예정이면 1차 복학 신청을 먼저 완료해야 전과 신청 가능', order: 2 },
    { id: 'route', label: '신청 방법', content: 'PC 종합정보시스템(모바일 불가) → 학적변동관리 → 전부/전과신청', order: 3 },
    { id: 'approval', label: '승인 절차', content: '희망 학부·학과 선택 → 전입 학부·학과장 승인 → 학교 최종 확정·허가', order: 4 },
    { id: 'caution', label: '전과 전 확인', content: '학과장 승인 후 취소 불가 · 전입 학과 교과과정 이수 · 졸업요건 재확인', order: 5 },
  ],
  course: [
    { id: 'pre', label: '예비수강신청', content: '2026. 07. 14.(화) 10:00 ~ 07. 15.(수) 15:00 (전체 재학생)', order: 1 },
    { id: 'main', label: '본 수강신청', content: '2026. 08. 12.(수) 10:00 ~ 08. 13.(목) 23:59 (전체 학생)', order: 2 },
    { id: 'system', label: '시스템 접속', content: '2026. 08. 11.(화) 09:30부터 재접속 가능 예정', order: 3 },
    { id: 'waitlist', label: '대기제', content: '정원 마감 강좌는 대기번호 부여 · 대기 최대 12학점, S러닝 최대 2강좌 · 순번 시 문자 후 60분 내 조정', order: 4 },
    { id: 'route', label: '신청 경로', content: '종합정보시스템 → 수강신청 → 강의 검색·신청', order: 5 },
  ],
  leave: [
    { id: 'general', label: '일반휴학 대상', content: '4주 이상 계속 수업이 불가한 학생 · 재학 중 총 3회 · 1학기 또는 2학기 단위', order: 1 },
    { id: 'period', label: '신청 시기', content: '학사일정의 휴학 신청기간 또는 개강일부터 4주 이내', order: 2 },
    { id: 'route', label: '신청 방법', content: '웹 종합정보시스템(모바일 불가) · 일반휴학은 별도 서류 없음', order: 3 },
    { id: 'documents', label: '종류별 서류', content: '질병(4주 이상 진단서) · 입대(입영통지서) · 임신출산/육아/창업 등은 종류별 서류 확인', order: 4 },
    { id: 'return', label: '복학 신청 기간', content: '1차 06.29~07.08 · 2차 07.20~07.30 · 3차 08.10~09.07 (최신 일정은 공지 확인)', order: 5 },
  ],
  etc: [
    { id: 'status', label: '현재 상태', content: '학사일정에 따라 상이', order: 1 },
    { id: 'period', label: '신청 기간', content: '학사일정 공지 참고', order: 2 },
    { id: 'eligibility', label: '지원 자격', content: '해당 공지의 대상자 요건 확인', order: 3 },
    { id: 'documents', label: '필요 서류', content: '해당 부서 안내 서류 준비', order: 4 },
    { id: 'route', label: '신청 경로', content: '종합정보시스템 또는 해당 부서 방문·전화 문의', order: 5 },
  ],
}

export const checklists = categories.map((category) => ({
  id: `checklist-${category.id}`,
  categoryId: category.id,
  order: category.order,
  items: checklistItemsByCategory[category.id],
}))

// 원문 공지(제목 + 원문 URL). 강남대 2026-2학기 통합안내의 실제 링크.
export const notices = [
  // 수강신청
  { id: 'n-course-overview', categoryId: 'course', title: '2026학년도 2학기 수강신청 종합 안내', url: 'https://app.kangnam.ac.kr/re.jsp?short_key=2lmt0w', postedAt: day('2026-07-09'), order: 1, viewCount: 0 },
  { id: 'n-course-pre-result', categoryId: 'course', title: '예비수강신청 결과 및 강좌별 잔여인원 조회 안내', url: 'https://app.kangnam.ac.kr/re.jsp?short_key=MwWxku', postedAt: day('2026-07-16'), order: 2, viewCount: 0 },
  { id: 'n-course-period-change', categoryId: 'course', title: '수강신청 기간 변경 안내', url: 'https://app.kangnam.ac.kr/re.jsp?short_key=buEcKD', postedAt: day('2026-07-10'), order: 3, viewCount: 0 },
  { id: 'n-course-military', categoryId: 'course', title: '군 복무 중 원격강좌 수강 안내', url: 'https://app.kangnam.ac.kr/re.jsp?short_key=xXSIxw', postedAt: day('2026-08-01'), order: 4, viewCount: 0 },
  // 전부·전과
  { id: 'n-transfer-2026-2', categoryId: 'transfer', title: '2026학년도 2학기 전부·전과 공지', url: 'https://web.kangnam.ac.kr/menu/board/info/f19069e6134f8f8aa7f689a4a675e66f.do?scrtWrtiYn=false&encMenuSeq=c5dc4b1d7b4dd402e5e6a7a8471eb55c&encMenuBoardSeq=a9281cba973c3b08c3da6ab07bf2f142', postedAt: day('2026-06-29'), order: 1, viewCount: 0 },
  { id: 'n-transfer-always', categoryId: 'transfer', title: '전부·전과 상시 안내', url: 'https://web.kangnam.ac.kr/menu/41c4ba211ab06cbc003455e07441b4f8.do?encMenuSeq=3a4030700fef59422915dadc03f67b33', postedAt: day('2026-06-01'), order: 2, viewCount: 0 },
  // 휴학·복학
  { id: 'n-leave-return-2026-2', categoryId: 'leave', title: '2026학년도 2학기 복학 공지', url: 'https://web.kangnam.ac.kr/menu/board/info/f19069e6134f8f8aa7f689a4a675e66f.do?scrtWrtiYn=false&encMenuSeq=c5dc4b1d7b4dd402e5e6a7a8471eb55c&encMenuBoardSeq=be6f8bd1151a1d7fb2aa5be47cb5f7ce', postedAt: day('2026-06-29'), order: 1, viewCount: 0 },
  { id: 'n-leave-always', categoryId: 'leave', title: '휴학·복학 상시 안내', url: 'https://web.kangnam.ac.kr/menu/12d2ee44cc4e95562f84a01bf953a054.do?encMenuSeq=a2643e9dc95f1078bfec0078c09a6ac2', postedAt: day('2026-06-01'), order: 2, viewCount: 0 },
]

// showOnHome: 홈 '지금 많이 묻는 질문' 섹션 노출 여부(교직원이 관리자 앱에서 조정).
export const faqEntries = [
  // ── 전과 ──
  { id: 'faq-transfer-eligibility', categoryId: 'transfer', question: '전부·전과 신청 자격이 어떻게 되나요?', answer: '다음을 모두 충족해야 합니다.\n• 2학기 이상의 과정을 이수한 학생\n• 다음 학기가 3~6번째 학기인 학생(7번째 학기 이상은 신청 불가)\n• 총 취득 성적의 평균평점이 2.5 이상\n• 현재 휴학 중이면서 다음 학기에 복학할 학생은 1차 복학 신청을 먼저 완료한 뒤 전과 신청 가능\n\n※ 융복합·공과대학 자율전공학부 입학자, 전공 폐지에 따른 전과는 성적 제한이 적용되지 않을 수 있습니다.', answerImageUrls: [], relatedNoticeIds: ['n-transfer-2026-2'], order: 1, pinned: true, showOnHome: true, viewCount: 0 },
  { id: 'faq-transfer-how', categoryId: 'transfer', question: '전과는 어떻게 신청하나요?', answer: '모바일에서는 신청할 수 없고 PC를 이용해야 합니다.\n1. 종합정보시스템 접속\n2. 학적변동관리 → 전부/전과신청\n3. 희망 학부·학과 선택 후 신청\n4. 전입 학부·학과장 승인\n5. 학교의 최종 확정 및 허가', answerImageUrls: [], relatedNoticeIds: ['n-transfer-2026-2', 'n-transfer-always'], order: 2, pinned: false, showOnHome: true, viewCount: 0 },
  { id: 'faq-transfer-limit', categoryId: 'transfer', question: '전과가 제한되는 경우가 있나요?', answer: '다음 대상·유형은 신청이 제한될 수 있습니다.\n• 사범대학 학과(전과 여석이 있는 경우에만 가능)\n• 미래인재개발대학 입학자, 특기자 전형 입학자, 일부 기독교학과 입학자\n• 단과대학 자유전공학부 입학자\n• 미래인재개발대학 내부 학부·학과 간 전과\n• 주간·야간이 동일한 학부 간 전과\n• 자율전공학부·융합자유전공학부 등으로의 전과', answerImageUrls: [], relatedNoticeIds: ['n-transfer-2026-2'], order: 3, pinned: false, showOnHome: false, viewCount: 0 },
  { id: 'faq-transfer-caution', categoryId: 'transfer', question: '전과 후 유의할 점은 무엇인가요?', answer: '• 전입 학부·학과장 승인 전에는 신청 화면에서 취소할 수 있으나, 승인 후에는 취소할 수 없습니다.\n• 전과 후에는 전입 학부·학과의 교과과정을 이수해야 합니다.\n• 계열 변경 시 등록금 차액이 추가 부과되거나 환불될 수 있습니다.\n• 공식 학적 변경은 다음 학기 개강일에 반영되며, 기존 학과 전공과목이 개강 후 타전공으로 바뀔 수 있으니 졸업요건을 다시 확인하세요.', answerImageUrls: [], relatedNoticeIds: [], order: 4, pinned: false, showOnHome: false, viewCount: 0 },

  // ── 수강신청 ──
  { id: 'faq-course-schedule', categoryId: 'course', question: '2026학년도 2학기 수강신청 일정이 어떻게 되나요?', answer: '• 예비 수강신청: 2026. 07. 14.(화) 10:00 ~ 07. 15.(수) 15:00\n• 자동 수강신청 결과 조회: 07. 16.(목) 14:00 이후\n• 강좌별 잔여 인원 조회: 08. 03.(월) 14:00 이후\n• 장애학생 선 수강신청: 08. 11.(화) 10:00 ~ 15:00\n• 전체 학생 수강신청: 08. 12.(수) 10:00 ~ 08. 13.(목) 23:59\n\n수강신청 시스템은 08. 11.(화) 09:30부터 재접속 가능 예정입니다.', answerImageUrls: [], relatedNoticeIds: ['n-course-overview'], order: 1, pinned: true, showOnHome: true, viewCount: 0 },
  { id: 'faq-course-priority', categoryId: 'course', question: '예비수강신청 자동 배정 우선순위는 어떻게 되나요?', answer: '• 교양: 예비수강신청자 전원(로드맵·전공 우선제 미적용)\n• 전공기초: 1학년 → 로드맵 해당자 → 그 외 신청자\n• 전공선택: 로드맵 해당자(제1전공 → 복수전공 → 부전공 → 타전공 순) → 이후 제1전공 → 복수전공 → 부전공 → 그 외 신청자', answerImageUrls: [], relatedNoticeIds: ['n-course-overview'], order: 2, pinned: false, showOnHome: true, viewCount: 0 },
  { id: 'faq-course-waitlist', categoryId: 'course', question: '수강 대기제(대기 신청)는 어떻게 운영되나요?', answer: '정원이 마감된 강좌에 신청 순서대로 대기번호를 부여합니다.\n• 개인별 최대 수강학점 +6학점 범위에서 대기 신청(대기 최대 12학점, S러닝 최대 2강좌)\n• 대기 순번이 되면 시스템이 자동 신청하고 문자를 발송합니다.\n• 학점 초과·시간 중복으로 자동 신청이 안 되면, 문자 수신 후 60분 이내에 직접 접속해 다른 강좌를 정리하고 대기 강좌를 신청해야 합니다(미조정 시 다음 순번으로 이동).', answerImageUrls: [], relatedNoticeIds: ['n-course-overview'], order: 3, pinned: false, showOnHome: true, viewCount: 0 },
  { id: 'faq-course-seminar', categoryId: 'course', question: '전공세미나는 꼭 들어야 하나요?', answer: '2026학년도 2학기에는 2025학번만 해당합니다.\n• 2025학년도 이후 신입학자의 졸업 필수 교과목으로, 졸업하려면 2회 이상 이수해야 합니다.\n• 2학년에 개설된 전공세미나 I·II 이수를 권장합니다.\n• 본인의 제1전공에서 개설된 강좌만 신청할 수 있으며, 주간 학생은 동일 전공의 야간 전공세미나도 신청할 수 있습니다.', answerImageUrls: [], relatedNoticeIds: ['n-course-overview'], order: 4, pinned: false, showOnHome: false, viewCount: 0 },
  { id: 'faq-course-military', categoryId: 'course', question: '군 복무 중 원격강좌를 수강할 수 있나요?', answer: '입대휴학 중인 학생이 원격수업으로 학점을 취득할 수 있는 제도입니다.\n• 학점: 학기당 6학점·연간 12학점·총 24학점 이내\n• 수강료: 2026-2학기 학점당 106,000원(국방부가 수업료의 80% 지원)\n• 절대평가로 시행하며 실제 수강한 학기 성적으로 인정\n• 신청: 2026. 08. 12.(수) 18:00 ~ 09. 07.(월) 23:59, 장병e음', answerImageUrls: [], relatedNoticeIds: ['n-course-military'], order: 5, pinned: false, showOnHome: false, viewCount: 0 },

  // ── 휴학 ──
  { id: 'faq-leave-general', categoryId: 'leave', question: '일반휴학 대상과 기간은 어떻게 되나요?', answer: '• 대상: 가정 사정 등으로 4주 이상 계속 수업을 받을 수 없는 학생\n• 횟수: 재학기간 중 총 3회까지\n• 기간: 한 번 신청할 때 1학기 또는 2학기 선택\n• 신청 시기: 학사일정의 휴학 신청기간 또는 개강일부터 4주 이내\n• 신청 방법: 웹 종합정보시스템(모바일 불가), 일반휴학은 별도 서류 없음', answerImageUrls: [], relatedNoticeIds: ['n-leave-always'], order: 1, pinned: true, showOnHome: true, viewCount: 0 },
  { id: 'faq-leave-types', categoryId: 'leave', question: '휴학 종류별 조건과 서류는 무엇인가요?', answer: '• 질병휴학: 4주 이상 수업 불가 / 종합병원의 4주 이상 진단서\n• 임신·출산휴학: 최대 4학기 / 임신진단서 또는 출생·가족관계 증빙\n• 육아휴학: 12세 이하 또는 초등 6학년 이하 자녀 / 최대 2학기 / 가족관계증명서·주민등록등본\n• 입대휴학: 군 복무기간, 재학 중 1회 / 입영일 2주 전부터 웹 신청, 입영통지서 등\n• 창업휴학: 별도 심사 통과 / 최대 4학기 / 창업교육팀 방문 및 서류', answerImageUrls: [], relatedNoticeIds: ['n-leave-always'], order: 2, pinned: false, showOnHome: false, viewCount: 0 },
  { id: 'faq-leave-course-tuition', categoryId: 'leave', question: '휴학하면 수강신청과 등록금은 어떻게 되나요?', answer: '• 휴학 신청 시 기존 수강신청 자료는 자동 삭제되며, 휴학을 취소해도 복구되지 않아 다시 수강신청해야 합니다.\n• 개강 후 일반·질병·임신출산 휴학을 하면 해당 학기 성적이 나오지 않습니다.\n• 등록금 납부 후 휴학하면 등록금이 복학 학기로 자동 대체됩니다(중간고사 이후 일부 휴학은 예외).\n• 신입·편입·재입학생은 첫 학기 일반휴학이 불가하며, 9학기 이상 등록자도 원칙적으로 일반휴학이 불가합니다.', answerImageUrls: [], relatedNoticeIds: [], order: 3, pinned: false, showOnHome: false, viewCount: 0 },

  // ── 복학(휴학 카테고리) ──
  { id: 'faq-leave-return-how', categoryId: 'leave', question: '복학은 어떻게 신청하나요?', answer: '복학은 모바일 신청·방문 접수가 불가능하며 종합정보시스템에서만 신청합니다.\n1. 종합정보시스템 접속\n2. 학적변동관리 → 복학신청 → 신규복학신청\n3. 복학원서 작성 및 서류 첨부\n4. 교무팀 처리 → 수강신청 및 등록금 납부\n\n신청 기간: 1차 06.29~07.08(예비+본 수강) · 2차 07.20~07.30(본 수강) · 3차 08.10~09.07(개강 후 변경기간). 최신 일정은 복학 공지에서 확인하세요.', answerImageUrls: [], relatedNoticeIds: ['n-leave-return-2026-2'], order: 4, pinned: false, showOnHome: true, viewCount: 0 },
  { id: 'faq-leave-return-military', categoryId: 'leave', question: '군 복학자는 어떤 서류를 제출하나요?', answer: '• 이미 전역한 학생: 전역증 앞·뒷면, 병적증명서, 병역사항이 포함된 주민등록초본 중 1개\n• 개강일로부터 4주 이내 전역 예정자: 전역예정증명서 또는 복무확인증명서\n• 개강 4주 이후 전역 예정자(휴가로 3주차부터 수업 참여 가능한 경우): 전역예정증명서, 휴가증 또는 휴가예정증명서, 서약서', answerImageUrls: [], relatedNoticeIds: ['n-leave-return-2026-2'], order: 5, pinned: false, showOnHome: false, viewCount: 0 },
]

// 학내 부서 연락처(2026년 7월 구내전화번호 안내 기반, 학사 관련 부서만 선별).
// 개인 실명은 제외하고 부서·업무·내선만 담는다. priority 1은 카테고리 전화 모달에 노출된다.
const contact = (id, team, topic, ext, group, categories, priority, order) => ({
  id, team, topic, ext: String(ext), phone: tel(ext), group, categories, priority, order,
})
export const contacts = [
  // 학사(교무팀) — 본부, 전 학년 공통
  contact('c-gyomu-record', '교무팀', '학적·성적·학점교류·제증명', 3542, '학사(교무팀)', ['transfer', 'leave', 'etc'], 1, 1),
  contact('c-gyomu-course', '교무팀', '교육과정·수강신청', 3543, '학사(교무팀)', ['course'], 1, 2),
  contact('c-gyomu-class', '교무팀', '수업·강의평가', 3544, '학사(교무팀)', ['course'], 2, 3),
  contact('c-gyomu-grad', '교무팀', '졸업', 3545, '학사(교무팀)', ['etc'], 2, 4),
  contact('c-gyomu-season', '교무팀', '계절수업·비교과', 3419, '학사(교무팀)', ['course'], 2, 5),
  // 학사(교학1팀)
  contact('c-gh1-record', '교학1팀', '학적·출석인정·휴보강', 3873, '학사(교학팀)', ['transfer', 'leave'], 2, 6),
  contact('c-gh1-course', '교학1팀', '교육과정·수강신청', 3874, '학사(교학팀)', ['course'], 2, 7),
  contact('c-gh1-time', '교학1팀', '시간표·수업·성적', 3875, '학사(교학팀)', ['course'], 2, 8),
  contact('c-gh1-grad', '교학1팀', '졸업·현장실습', 3872, '학사(교학팀)', ['etc'], 2, 9),
  // 학사(교학2팀)
  contact('c-gh2-record', '교학2팀', '학적·출석인정·강의실', 3461, '학사(교학팀)', ['transfer', 'leave'], 2, 10),
  contact('c-gh2-course', '교학2팀', '수강신청·시험및성적', 3458, '학사(교학팀)', ['course'], 2, 11),
  contact('c-gh2-grad', '교학2팀', '교육과정·졸업', 3463, '학사(교학팀)', ['etc'], 2, 12),
  contact('c-gh2-teach', '교학2팀', '교직', 3462, '학사(교학팀)', ['etc'], 2, 13),
  // 학사(기타 단과대)
  contact('c-chamin', '참인재대학 교학팀', '교양교육과정', 3847, '학사(교학팀)', ['course'], 2, 14),
  contact('c-free', '자유전공학부 교학팀', '학사행정', 7226, '학사(교학팀)', ['course', 'transfer', 'leave'], 2, 15),
  contact('c-grad-office', '대학원교학팀', '대학원 학적·수업·논문', 3470, '학사(교학팀)', ['etc'], 2, 16),
  // 원격교육
  contact('c-remote', '원격교육지원센터', '원격수업·S러닝·LMS', 3446, '원격교육', ['course'], 1, 17),
  // 장학·복지
  contact('c-jang-nat', '장학복지팀', '국가장학금', 3552, '장학·복지', ['etc'], 1, 18),
  contact('c-jang-in', '장학복지팀', '교내장학금', 3551, '장학·복지', ['etc'], 2, 19),
  contact('c-jang-work', '장학복지팀', '국가근로·교외장학', 3548, '장학·복지', ['etc'], 2, 20),
  // 진로·취업
  contact('c-job', '대학일자리플러스센터', '진로·취업 상담', 3558, '진로·취업', ['etc'], 1, 21),
  contact('c-field', '현장실습지원센터', '현장실습', 3108, '진로·취업', ['etc'], 2, 22),
  // 상담·지원
  contact('c-counsel', '마음나눔센터', '심리상담·검사', 7200, '상담·지원', ['etc'], 1, 23),
  contact('c-disability', '장애학생지원센터', '장애학생 학습·생활 지원', 7178, '상담·지원', ['etc'], 2, 24),
  // 입학
  contact('c-admission', '입학전형관리팀', '수시·정시', 3856, '입학', ['etc'], 2, 25),
  contact('c-transfer-in', '입학전형관리팀', '편입학', 7141, '입학', ['etc'], 2, 26),
  // 창업
  contact('c-startup', '창업지원팀', '창업교육·창업휴학', 3639, '창업', ['leave', 'etc'], 2, 27),
  // 전산·시스템
  contact('c-helpdesk', '전산유지보수 헬프데스크', '종합정보시스템·수강신청 시스템 문의', 3119, '전산·시스템', ['course', 'etc'], 1, 28),
]

// 상담사 연결 폼의 학과 선택지(Firestore `departments`).
// ⚠ 아래 목록은 초안입니다. 학교 홈페이지의 실제 학부·학과 명칭으로 확인·수정하세요.
//    관리자 앱/콘솔에서 추가·수정해도 되며, 학생 웹은 항상 Firestore 값을 그대로 씁니다.
// aliases: 학생이 줄임말로 입력해도 매칭되도록 하는 별칭(대소문자·공백·괄호는 무시하고 비교).
const department = (id, label, aliases, order) => ({ id, label, aliases, order })

export const departments = [
  department('ict-convergence', 'ICT융합공학부', ['ict', 'ict융합', 'ict융합공학과', '아이씨티융합공학부'], 1),
  department('software', '소프트웨어응용학부', ['sw', '소프트웨어', '소프트웨어응용학과', '소웨'], 2),
  department('ai-convergence', '인공지능융합공학부', ['ai', '인공지능', '인공지능융합공학과'], 3),
  department('industrial-data', '산업데이터사이언스학부', ['산업데이터', '데이터사이언스', '산디사'], 4),
  department('social-welfare', '사회복지학부', ['사복', '사회복지', '사회복지학과'], 5),
  department('silver-industry', '실버산업학과', ['실버', '실버산업'], 6),
  department('early-childhood', '유아교육과', ['유아교육', '유교과'], 7),
  department('special-edu-elementary', '초등특수교육과', ['초등특수', '초특'], 8),
  department('special-edu-secondary', '중등특수교육과', ['중등특수', '중특'], 9),
  department('business', '경영학부', ['경영', '경영학과'], 10),
  department('tax', '세무학과', ['세무'], 11),
  department('real-estate', '부동산건설학부', ['부동산', '부동산학과', '건설'], 12),
  department('public-affairs', '공공인재학과', ['공공인재', '행정', '행정학과'], 13),
  department('global-culture', '글로벌문화학부', ['글로벌문화', '글문'], 14),
  department('christian-studies', '기독교학과', ['기독교', '신학', '신학과'], 15),
  // 목록에서 자기 학과를 찾지 못한 학생용 항목. 지우지 마세요.
  department('etc', '기타', ['해당없음', '기타학과'], 999),
]
