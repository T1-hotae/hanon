# 학사 한눈에

React 18 + Vite + TypeScript 기반 학생용 학사 안내 웹입니다. 학생 웹은 Firestore의 `categories`, `keywordPresets`, `faqEntries`, `checklists`, `notices`를 읽고, 채팅 문의는 `inquiries`에 `pending` 상태로 생성합니다. Firebase가 설정되지 않았거나 조회에 실패하면 기본 mock 데이터로 동작합니다.

관리자 데스크탑 앱은 별도 프로젝트로 `C:\Users\USER\Desktop\han-non-e-admin`에 생성되어 있습니다.

## 학생 웹 실행

```bash
npm install
npm run dev
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
