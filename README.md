# 학사 한눈에

React 18 + Vite + TypeScript 기반 학생용 학사 안내 웹입니다. 학생 웹은 Firestore의 `categories`, `keywordPresets`, `faqEntries`, `checklists`, `notices`를 읽고, 채팅 문의는 `inquiries`에 `pending` 상태로 생성합니다. Firebase가 설정되지 않았거나 조회에 실패하면 기본 mock 데이터로 동작합니다.

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

## Firestore 보안 규칙

`firestore.rules`를 Firebase 콘솔 또는 Firebase CLI로 배포하세요.

- `categories`, `keywordPresets`, `faqEntries`, `checklists`, `notices`: 공개 읽기, 로그인 사용자만 쓰기
- `inquiries`: 학생은 `pending` 문의 생성만 가능, 읽기/수정/삭제는 로그인 사용자만 가능

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
