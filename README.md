# 학사 한눈에

React 18 + Vite + TypeScript 기반 학생용 학사 안내 웹입니다. 학생 웹은 Firestore의 `categories`, `faqEntries`, `checklists`, `notices`를 읽고, 채팅 문의는 `inquiries`에 `pending` 상태로 생성합니다. 모든 학사 데이터는 Firestore 전용이며(mock 폴백 없음), Firebase가 설정되지 않았거나 데이터가 없으면 빈 상태로 표시됩니다. 홈 '지금 많이 묻는 질문' 섹션은 `faqEntries` 중 `showOnHome`이 켜진 항목을 카테고리 필터·페이지네이션으로 보여줍니다.

관리자 데스크탑 앱은 별도 프로젝트로 `C:\Users\USER\Desktop\han-non-e-admin`에 생성되어 있습니다.

## 학생 웹 실행

```bash
npm install
npm run dev
```

> 참고: `npm run dev`(Vite)는 `/api/chat` 서버리스 함수를 실행하지 않습니다. AI 챗봇을 로컬에서 테스트하려면 `vercel dev`로 띄우세요(아래 "AI 챗봇" 참고).

## AI 챗봇 (OpenAI)

학생 채팅에서 학사 안내를 자동 응답하는 AI 챗봇입니다. 학사 데이터(FAQ·공지·체크리스트)를 근거로 답하고, 확신이 낮으면 자동으로 담당자에게 연결(`needsHuman`)합니다.

- 두뇌: OpenAI API. 프록시 함수 [`api/chat.ts`](api/chat.ts)가 키를 보관하고 호출합니다.
- **`OPENAI_API_KEY`는 서버 전용입니다.** `VITE_` 접두어를 붙이면 브라우저 번들에 키가 노출되니 절대 금지. `/api/chat`에서만 `process.env.OPENAI_API_KEY`로 읽습니다.
- 모델은 기본 `gpt-4o-mini`(`OPENAI_MODEL`로 변경 가능).

### 팀 세팅 (배포 = Vercel)

1. OpenAI 플랫폼에서 API 키를 발급받습니다(결제 수단 등록 필요, 이 규모의 사용량은 매우 저렴).
2. Vercel 프로젝트 → **Settings → Environment Variables** 에 `OPENAI_API_KEY`(및 선택 `OPENAI_MODEL`)를 추가합니다. **한 번만 등록하면 배포된 사이트를 팀 전원이 그대로 사용**할 수 있습니다(각자 키 불필요).
3. 로컬 테스트는 각자 `.env`에 `OPENAI_API_KEY`를 넣고 `vercel dev`로 실행합니다.

```bash
npm i -g vercel   # 최초 1회
vercel dev        # /api/chat 포함 로컬 실행
```

## 학생 웹 빌드

```bash
npm run build
```

## Firestore 초기 데이터 입력

1. Firebase CLI 또는 Google ADC 로그인을 준비합니다.
2. `.env` 또는 셸 환경에 `FIREBASE_PROJECT_ID`를 설정합니다.
3. seed를 실행합니다.

```bash
npm run seed
```

## Firestore 초기화(DB 리셋)

테스트 데이터를 지우고 처음부터 다시 시작하고 싶을 때 사용합니다. **되돌릴 수 없으니 운영 중인 프로젝트에서는 주의하세요.**

```bash
npm run reset            # 무엇이 지워질지만 보여줌(dry-run, 실제 삭제 없음)
npm run reset -- --confirm   # 실제 삭제 실행
npm run seed              # 기본 카테고리/예시질문/체크리스트/공지/FAQ 다시 채우기
```

`categories`, `keywordPresets`, `faqEntries`, `checklists`, `notices`, `inquiries`, `conversations`(하위 `messages` 포함) 컬렉션을 통째로 삭제합니다. Firebase Authentication에 만들어 둔 관리자 로그인 계정이나 Storage에 이미 올라간 파일은 지우지 않습니다(따로 정리해야 함).

컬렉션 1~2개만 지우고 싶다면 스크립트 대신 [Firebase 콘솔](https://console.firebase.google.com) → Firestore Database에서 해당 컬렉션을 직접 삭제해도 됩니다(콘솔에서 컬렉션 삭제 시에도 하위 문서가 함께 삭제됩니다).

## Firestore 보안 규칙

`firestore.rules`를 Firebase 콘솔 또는 Firebase CLI로 배포하세요.

- `categories`, `keywordPresets`, `faqEntries`, `checklists`, `notices`, `departments`: 공개 읽기, 로그인 사용자만 쓰기
- `inquiries`: 학생은 `pending` 문의 생성만 가능, 읽기/수정/삭제는 로그인 사용자만 가능
- `conversations`: 학생이 식별정보(학번·학과·이름)를 쓸 때 형식을 검증한다(아래 "학생 식별정보 규칙")

## 학생 식별정보 규칙 (학번·학과·이름)

'상담사 연결' 시 받는 학번·학과·이름의 정제/검증 규칙은 [`src/utils/studentIdentity.ts`](src/utils/studentIdentity.ts) 한 곳에 모여 있습니다. 화면(`ChatPage`)과 저장(`chatService`)이 모두 이 파일만 사용합니다.

| 필드 | 규칙 | 자동 정제 |
| --- | --- | --- |
| 학번 | 숫자 9자리(예: `202104390`). 앞 4자리 입학연도가 1990 이전이거나 내년 이후면 **경고만** 표시(편입·재입학 예외를 막지 않기 위해 제출은 허용) | 하이픈·공백·전각숫자(`２`) 제거 후 9자리까지 |
| 학과 | Firestore `departments` 목록에 있는 학과만. 목록이 비어 있으면(미시드) 2~30자 자유 입력으로 자동 완화 | 별칭·공백·대소문자 무시 매칭 → **정식 명칭 + 표준 id**로 저장 |
| 이름 | 한글 2~6자 또는 영문 2~30자. 미완성 한글(`ㅎㅗㅌㅐ`)·숫자·특수문자 차단 | 앞뒤 공백 제거, 연속 공백 1칸 |

- 학번 자릿수를 바꾸려면 `studentIdentity.ts`의 `STUDENT_NUMBER_LENGTH`와 `firestore.rules`의 `identityFilled()` 정규식을 함께 수정하세요.
- 학과 목록은 `scripts/seed-data.mjs`의 `departments` 배열로 시드되며, **초안이므로 실제 학부·학과 명칭으로 확인·수정이 필요합니다.** 이후에는 Firebase 콘솔/관리자 앱에서 직접 수정해도 됩니다. `aliases`에 줄임말(`ict`, `사복` 등)을 넣어두면 학생이 줄여 입력해도 매칭됩니다.
- 목록에서 자기 학과를 찾지 못한 학생을 위해 `기타` 항목을 남겨 두세요.
- 브라우저 검증은 우회될 수 있으므로 `firestore.rules`에서 한 번 더 검사합니다. 규칙을 배포해야 실제로 적용됩니다.

```bash
firebase deploy --only firestore:rules
npm run seed:web   # departments 컬렉션 시드(또는 npm run seed)
```

## 관리자 앱

```bash
cd C:\Users\USER\Desktop\han-non-e-admin
npm install
npm run build
npm run tauri:dev
```

관리자 앱은 `VITE_ADMIN_LOGIN_EMAIL`의 고정 이메일 계정으로 `signInWithEmailAndPassword`를 호출하며, 화면에는 비밀번호 입력창만 표시합니다. Firebase Authentication에 해당 이메일 계정을 만들어 두고 비밀번호를 공유하면 됩니다.

Tauri 실행 파일 빌드:

```bash
npm run tauri:build
```

빌드 결과 실행 파일은 `C:\Users\USER\Desktop\han-non-e-admin\src-tauri\target\release\han-non-e-admin.exe`에 생성됩니다.
