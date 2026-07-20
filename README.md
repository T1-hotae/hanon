# 학사 통합 안내 서비스

React 18 + Vite + TypeScript로 만든 학사 문의 통합 안내 프로토타입입니다. 학생용 화면과 관리자용 화면을 헤더 토글로 전환하며, Firebase 환경변수가 없으면 목업 데이터로 자동 실행됩니다.

## 로컬 실행

```bash
npm install
npm run dev
```

## 빌드

```bash
npm run build
```

## Vercel 배포

- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- SPA 라우팅 새로고침 대응은 `vercel.json`의 rewrite 설정으로 처리합니다.

Firebase를 연결할 경우 Vercel 환경변수에 `.env.example`의 `VITE_` 키를 채우면 됩니다. 값이 없으면 데모용 목업 데이터로 폴백합니다.
