# 문의할게 무니? — 문무니 (Munmuni)

강남대학교 재학생을 위한 **문의 중심 학사 안내 웹서비스**입니다.
학생은 주제를 고르지 않고 질문 한 줄을 던지고, AI가 학교 자료(FAQ·공지·체크리스트·부서 연락처)를 근거로 답합니다.
AI가 확신하지 못하는 질문은 **상담사 전용 채팅**으로 연결하고, 전화가 더 빠른 문의는 **부서 번호를 바로 연결**합니다.

이 저장소는 **학생 웹(React SPA) + 공용 서버리스 API**를 담습니다.
교직원용 관리자 데스크탑 앱은 별도 프로젝트(`C:\Users\USER\Desktop\han-non-e-admin`, Tauri)입니다.

| 문서 | 내용 |
| --- | --- |
| [docs/OVERVIEW.md](docs/OVERVIEW.md) | 서비스 개요·타겟층·핵심 기능·아키텍처·데이터 모델 |
| [docs/DESIGN.md](docs/DESIGN.md) | 디자인 토큰·컴포넌트 패턴·화면별 UI 규칙·접근성 |
| (이 문서) | 실행·빌드·배포, 환경변수, Firestore 시드/리셋/규칙 |

> **네이밍 참고** — 초기 이름 "학사 한눈에"가 코드 일부(AI 시스템 프롬프트 [`api/chat.ts`](api/chat.ts), 기본 관리자 이메일 `admin@han-non-e.internal`, 저장소 폴더명 `han-non-e`)에 남아 있습니다. 현재 정식 서비스명은 **문무니**입니다.

---

## 기술 스택

React 18 · TypeScript · Vite 8 · React Router 6 · CSS Modules
Firebase (Firestore + Authentication + Storage) · OpenAI API · Vercel Serverless Functions

모든 학사 데이터는 **Firestore 전용**입니다(mock 폴백 없음).
Firebase가 설정되지 않았거나 데이터가 없으면 화면은 **빈 상태로 표시**됩니다 — 가짜 데이터가 진짜처럼 보이지 않게 하려는 의도입니다.

---

## 빠른 시작

**요구사항** — Node `^20.19.0 || >=22.12.0` (Vite 8 요구사항)

```bash
npm install
cp .env.example .env   # 값 채우기 (아래 "환경 변수" 참고)
npm run dev            # http://localhost:5173
```

> ⚠️ `npm run dev`(Vite)는 `/api/*` 서버리스 함수를 실행하지 않습니다.
> **AI 챗봇을 로컬에서 테스트하려면 `vercel dev`로 띄우세요.**

```bash
npm i -g vercel   # 최초 1회
vercel dev        # /api/chat 포함 로컬 실행
```

---

## 환경 변수

`.env.example`을 복사해 `.env`를 만듭니다.

### 클라이언트 (브라우저 번들에 포함됨 — 비밀값 금지)

| 변수 | 용도 |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | Firebase 웹 앱 설정 |
| `VITE_FIREBASE_AUTH_DOMAIN` | |
| `VITE_FIREBASE_PROJECT_ID` | |
| `VITE_FIREBASE_STORAGE_BUCKET` | |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | |
| `VITE_FIREBASE_APP_ID` | |
| `VITE_ADMIN_LOGIN_EMAIL` | 관리자 고정 로그인 이메일. 기본값 `admin@han-non-e.internal` |

**6개 Firebase 값이 모두 채워져야** Firebase가 초기화됩니다. 하나라도 비면 `isFirebaseConfigured()`가 `false`가 되어 앱은 데이터 없는 상태로 뜹니다([`src/services/firebase.ts`](src/services/firebase.ts)).

### 서버 전용 (Vercel 환경변수 — `VITE_` 접두어 절대 금지)

| 변수 | 용도 |
| --- | --- |
| `OPENAI_API_KEY` | **필수.** `/api/chat`, `/api/admin/classify`에서만 읽습니다 |
| `OPENAI_MODEL` | 선택. 기본 `gpt-4o-mini` |
| `FIREBASE_PROJECT_ID` | 시드/리셋 스크립트, 관리자 API 토큰 검증 |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | 관리자 API용. ADC를 못 쓰는 환경에서 서비스 계정 JSON 원문 |
| `FIREBASE_SERVICE_ACCOUNT_BASE64` | 위 값의 base64 인코딩(둘 중 하나만) |

> `OPENAI_API_KEY`에 `VITE_` 접두어를 붙이면 **브라우저 번들에 키가 그대로 노출**됩니다. 절대 금지.

---

## npm 스크립트

| 명령 | 설명 |
| --- | --- |
| `npm run dev` | Vite 개발 서버 (`/api/*` 미포함) |
| `npm run build` | `tsc -b` 타입 체크 후 프로덕션 빌드 → `dist/` |
| `npm run preview` | 빌드 결과 로컬 확인 |
| `npm run lint` | oxlint |
| `npm run seed` | Firestore 기본 데이터 입력 (firebase-admin / **ADC 필요**) |
| `npm run seed:web` | Firestore 기본 데이터 입력 (웹 SDK / **ADC 불필요**, 관리자 비밀번호로) |
| `npm run reset` | 컬렉션 삭제 — 기본은 dry-run |

---

## 프로젝트 구조

```
api/                        Vercel 서버리스 함수
  chat.ts                   학생 챗봇 프록시 (OpenAI 호출, 키 보관)
  admin/classify.ts         문의 주제 AI 분류 (관리자 전용)
  admin/_auth.ts            Bearer 토큰 검증 (sign_in_provider == 'password')
src/
  pages/                    HomePage · ChatPage · NoticesPage · DirectoryPage · SearchPage
  components/               Header · Layout · ChatHistoryPanel · TopTabs · AnimatedMascot 등
  context/                  AcademicDataContext (학사 데이터 1회 로드 후 전역 공유)
  services/
    firebase.ts             Firebase 초기화 (설정 없으면 undefined)
    inquiryService.ts       학사 데이터 읽기 · 문의/조회수 기록
    chatService.ts          대화 생성·구독·전송, /api/chat 호출
  utils/studentIdentity.ts  학번·학과·이름 정제/검증 (단일 소스)
  types/academic.ts         전체 데이터 타입
  constants.ts              카테고리 정렬, 인기 검색어, 키워드 기반 카테고리 추정
  App.module.css            컴포넌트 스타일 전체 (단일 CSS Module)
  index.css                 전역 토큰
scripts/                    seed / seed-web / reset / seed-data / read-env
firestore.rules             보안 규칙 (권한 설계의 핵심)
firestore.indexes.json      복합 색인
storage.rules               Storage 규칙
vercel.json                 SPA rewrite (단, /api/* 는 제외)
docs/                       OVERVIEW.md · DESIGN.md
number_collect.md           구내전화번호 원본 정리 (2026년 7월 기준)
```

---

## AI 챗봇 (OpenAI)

학생 채팅에서 학사 안내를 자동 응답합니다. 학사 데이터(FAQ·공지·체크리스트·부서 연락처·카테고리)를 근거로 답하고, 확신이 낮으면(`confident: false`) 상담사 연결을 안내합니다.

- 두뇌: OpenAI Chat Completions. 프록시 함수 [`api/chat.ts`](api/chat.ts)가 키를 보관하고 호출합니다.
- 응답은 JSON 스키마로 강제합니다 — `answer` / `confident` / `relatedNoticeIds`.
- **자료에 없는 내용은 지어내지 않도록** 프롬프트에 명시하고, 개인 학적·성적 등 개별 확인이 필요한 질문은 상담사로 넘깁니다.
- 모델은 기본 `gpt-4o-mini` (`OPENAI_MODEL`로 변경).

### 팀 세팅 (배포 = Vercel)

1. OpenAI 플랫폼에서 API 키를 발급받습니다(결제 수단 등록 필요, 이 규모의 사용량은 매우 저렴).
2. Vercel 프로젝트 → **Settings → Environment Variables** 에 `OPENAI_API_KEY`(및 선택 `OPENAI_MODEL`)를 추가합니다.
   **한 번만 등록하면 배포된 사이트를 팀 전원이 그대로 사용**할 수 있습니다(각자 키 불필요).
3. 로컬 테스트는 각자 `.env`에 `OPENAI_API_KEY`를 넣고 `vercel dev`로 실행합니다.

---

## 관리자 API — 문의 주제 분류

관리자 앱이 호출하는 `POST /api/admin/classify`는 학생 문의를 운영 통계용 주제(`topic` / `topicKey`)로 묶습니다.

- **관리자 전용** — `Authorization: Bearer <Firebase ID 토큰>` 필수.
  토큰의 `sign_in_provider`가 `password`인 경우만 통과합니다(익명 학생 토큰은 거부).
- 토큰 검증에 `FIREBASE_PROJECT_ID` + (ADC 또는 `FIREBASE_SERVICE_ACCOUNT_JSON` / `..._BASE64`)가 필요합니다.
- 기존 주제(`existingTopics`)가 있으면 **재사용을 강제**해 주제가 무한히 늘어나는 것을 막습니다.

---

## Firestore 초기 데이터 입력

두 방법 중 편한 쪽을 쓰세요. 넣는 데이터는 동일합니다
(`categories`, `checklists`, `notices`, `faqEntries`, `contacts`, `departments` — [`scripts/seed-data.mjs`](scripts/seed-data.mjs)).

### 방법 1 — `npm run seed` (firebase-admin, ADC 필요)

```bash
gcloud auth application-default login        # 또는 GOOGLE_APPLICATION_CREDENTIALS 설정
# .env 또는 셸에 FIREBASE_PROJECT_ID (없으면 VITE_FIREBASE_PROJECT_ID 사용)
npm run seed
```

### 방법 2 — `npm run seed:web` (웹 SDK, ADC 불필요)

`VITE_ADMIN_LOGIN_EMAIL` 계정으로 로그인해 넣습니다. Google ADC 설정 없이 `.env`만으로 동작합니다.

```bash
npm run seed:web                          # 비밀번호를 대화형으로 입력(화면에 표시되지 않음)
npm run seed:web -- <관리자비밀번호>       # 인자로 전달
npm run seed:web -- <관리자비밀번호> --reset  # 기존 데이터 삭제 후 다시 채우기
ADMIN_PASSWORD=<비밀번호> npm run seed:web    # 환경변수로 전달
```

---

## Firestore 초기화 (DB 리셋)

테스트 데이터를 지우고 처음부터 다시 시작할 때 사용합니다. **되돌릴 수 없으니 운영 중인 프로젝트에서는 주의하세요.**

```bash
npm run reset                # 무엇이 지워질지만 보여줌 (dry-run, 실제 삭제 없음)
npm run reset -- --confirm   # 실제 삭제 실행
npm run seed                 # 기본 데이터 다시 채우기
```

삭제 대상: `categories`, `keywordPresets`, `faqEntries`, `checklists`, `departments`, `notices`, `inquiries`, `conversations`(하위 `messages` 포함).

지우지 **않는** 것:

- **`contacts`(부서 연락처)** — 리셋 목록에 없습니다. 전화번호부 데이터는 그대로 남습니다.
- Firebase Authentication의 관리자 계정, Storage에 올라간 파일 — 필요하면 콘솔에서 따로 정리하세요.

컬렉션 1~2개만 지우고 싶다면 [Firebase 콘솔](https://console.firebase.google.com) → Firestore Database에서 직접 삭제해도 됩니다(콘솔에서 컬렉션 삭제 시 하위 문서도 함께 삭제됩니다).

---

## Firestore 보안 규칙

[`firestore.rules`](firestore.rules)를 배포하세요. **배포하지 않으면 규칙이 적용되지 않습니다.**

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes,storage   # 색인·Storage 규칙까지
```

- 관리자 = **이메일/비밀번호** 로그인 사용자(`sign_in_provider == 'password'`), 학생 = **익명** 로그인. 규칙에서 둘을 구분합니다.
- `categories`, `keywordPresets`, `faqEntries`, `checklists`, `contacts`, `departments`, `notices`: **공개 읽기 / 관리자만 쓰기.**
  단, 로그인 사용자는 `faqEntries`·`notices`의 **`viewCount`만** 갱신할 수 있습니다.
- `inquiries`: 학생은 `status: 'pending'` **생성만** 가능. 읽기/수정/삭제는 관리자만.
- `conversations`: 학생은 **본인 대화만**(`studentId == uid`). 식별정보를 쓸 때 형식을 검증합니다(아래 참고).
- **상담사는 AI 대화를 볼 수 없습니다** — `conversations` 읽기는 `needsHuman == true`로, `messages` 읽기는 `from != 'ai'`로 제한됩니다.
  규칙은 필터가 아니므로 **관리자 앱 쿼리도 같은 조건**(`where('needsHuman','==',true)`, `where('from','!=','ai')`)을 걸어야 합니다.
- 삭제는 관리자만. 학생의 '기록 초기화'는 실제 삭제가 아니라 `hiddenForStudent` 숨김 처리입니다.

---

## 학생 식별정보 규칙 (학번·학과·이름)

'상담사 연결' 시 받는 값의 정제/검증 규칙은 [`src/utils/studentIdentity.ts`](src/utils/studentIdentity.ts) 한 곳에 모여 있습니다.
화면(`ChatPage`)과 저장(`chatService`)이 모두 이 파일만 사용합니다.

| 필드 | 규칙 | 자동 정제 |
| --- | --- | --- |
| 학번 | 숫자 9자리(예: `202104390`). 앞 4자리 입학연도가 1990 이전이거나 내년 이후면 **경고만** 표시(편입·재입학 예외를 막지 않기 위해 제출은 허용) | 하이픈·공백·전각숫자(`２`) 제거 후 9자리까지 |
| 학과 | Firestore `departments` 목록에 있는 학과만. 목록이 비어 있으면(미시드) 2~30자 자유 입력으로 자동 완화 | 별칭·공백·대소문자 무시 매칭 → **정식 명칭 + 표준 id**로 저장 |
| 이름 | 한글 2~6자 또는 영문 2~30자. 미완성 한글(`ㅎㅗㅌㅐ`)·숫자·특수문자 차단 | 앞뒤 공백 제거, 연속 공백 1칸 |

- 학번 자릿수를 바꾸려면 `studentIdentity.ts`의 `STUDENT_NUMBER_LENGTH`와 `firestore.rules`의 `identityFilled()` 정규식을 **함께** 수정하세요.
- 학과 목록은 `scripts/seed-data.mjs`의 `departments` 배열로 시드되며, **초안이므로 실제 학부·학과 명칭으로 확인·수정이 필요합니다.**
  이후에는 Firebase 콘솔/관리자 앱에서 직접 수정해도 됩니다. `aliases`에 줄임말(`ict`, `사복` 등)을 넣어두면 학생이 줄여 입력해도 매칭됩니다.
- 목록에서 자기 학과를 찾지 못한 학생을 위해 `기타` 항목을 남겨 두세요.
- 브라우저 검증은 우회될 수 있으므로 `firestore.rules`에서 한 번 더 검사합니다.

```bash
firebase deploy --only firestore:rules
npm run seed:web   # departments 컬렉션 시드 (또는 npm run seed)
```

---

## 배포

### 학생 웹 + API (Vercel)

```bash
npm run build   # 로컬 검증
vercel --prod   # 또는 GitHub 연동 후 push
```

- [`vercel.json`](vercel.json)이 SPA rewrite를 걸어 모든 경로를 `index.html`로 보냅니다. `/api/*`는 제외되어 서버리스 함수로 갑니다.
- 배포 전 Vercel 환경변수에 `OPENAI_API_KEY`와 `VITE_FIREBASE_*`가 등록되어 있어야 합니다.

### Firebase 규칙

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
```

---

## 관리자 앱

```bash
cd C:\Users\USER\Desktop\han-non-e-admin
npm install
npm run build
npm run tauri:dev
```

관리자 앱은 `VITE_ADMIN_LOGIN_EMAIL`의 고정 이메일 계정으로 `signInWithEmailAndPassword`를 호출하며, 화면에는 비밀번호 입력창만 표시합니다.
Firebase Authentication에 해당 이메일 계정을 만들어 두고 비밀번호를 공유하면 됩니다.

Tauri 실행 파일 빌드:

```bash
npm run tauri:build
```

빌드 결과 실행 파일은 `C:\Users\USER\Desktop\han-non-e-admin\src-tauri\target\release\han-non-e-admin.exe`에 생성됩니다.

---

## 트러블슈팅

| 증상 | 원인 / 해결 |
| --- | --- |
| 채팅에서 "답변을 불러오지 못했어요" | `npm run dev`로 띄웠다 → `/api/chat`이 없음. `vercel dev` 사용 |
| `OPENAI_API_KEY가 서버에 설정되지 않았습니다.` | `.env`(로컬) 또는 Vercel 환경변수에 키 추가 |
| 화면이 전부 비어 있음 | `VITE_FIREBASE_*` 6개 중 하나라도 비었거나 Firestore에 데이터 없음 → `.env` 확인 후 `npm run seed:web` |
| 채팅 기록이 저장되지 않음 | 익명 로그인 실패. Firebase 콘솔 → Authentication → **익명 로그인 사용 설정** 확인 |
| 상담사 연결 시 저장 실패 | `firestore.rules` 미배포 또는 식별정보 형식 불일치. 규칙 배포 후 재시도 |
| 관리자 앱에 대화가 보이지 않음 | 규칙상 `needsHuman == true`만 읽힙니다. 쿼리 조건 확인 |
| `npm run seed` 인증 오류 | ADC 미설정. `gcloud auth application-default login` 또는 `npm run seed:web` 사용 |
