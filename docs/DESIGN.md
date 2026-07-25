# 문무니(Munmuni) 디자인 가이드

강남대학교 학사 안내 서비스 **문무니**의 UI 디자인 시스템 문서입니다.
브랜드 마스코트(양 "문무니")를 중심으로 한 **따뜻한 테라코타·크림 팔레트**, 부드러운 라운드, 절제된 그림자를 기본 언어로 사용합니다.

> 모든 스타일 토큰은 [`src/index.css`](../src/index.css)의 CSS 변수로 정의되어 있고,
> 컴포넌트 스타일은 CSS Module [`src/App.module.css`](../src/App.module.css)에 모여 있습니다.

---

## 1. 디자인 원칙

1. **따뜻하고 친근하게** — 딱딱한 행정 서비스가 아니라, 마스코트가 안내하는 다정한 톤.
2. **플랫 2D** — 유광 그라데이션·과한 입체 그림자를 지양하고, 단색 면 + 얇은 테두리로 표현.
3. **정보가 눈에 잘 띄게** — 흐린 회색 박스 나열 대신, 강조색 배지·구분선·hover 하이라이트로 위계를 만든다.
4. **일관된 라운드와 여백** — 정해진 radius/shadow 토큰만 사용해 화면 전체가 하나의 시스템으로 읽히게.

---

## 2. 디자인 토큰

### 2.1 색상

| 토큰 | 값 | 용도 |
| --- | --- | --- |
| `--color-bg` | `#faf5ef` | 페이지 배경(크림) |
| `--color-surface` | `#ffffff` | 카드·헤더·입력 표면 |
| `--color-text` | `#2b241e` | 본문 텍스트 |
| `--color-text-muted` | `#857567` | 보조 텍스트·메타 정보 |
| `--color-border` | `#ece2d6` | 테두리·구분선 |
| `--color-primary` | `#b0491f` | 주요 액션·강조(테라코타) |
| `--color-primary-hover` | `#8f3a17` | primary hover |
| `--color-accent` | `#e08a3c` | 포인트(주황)·아이콘·전송 버튼 |
| `--color-accent-soft` | `#fbeede` | 강조 배경(배지·아이콘 원·hover 하이라이트) |

**색 사용 규칙**

- **Primary(테라코타)**: 주 버튼, 링크, 선택 상태, hover 시 강조 텍스트.
- **Accent(주황)**: 마스코트 관련 UI, 전송 버튼, 카테고리 아이콘, 리스트 포인트 마커.
- **Accent-soft**: "칠해진 강조"가 필요하지만 튀지 않아야 할 때 — 배지 배경, 아이콘 원, hover 배경.
- 선택 텍스트 하이라이트: `rgba(176, 73, 31, 0.18)`.
- 포커스 링: `2px solid var(--color-primary)` (`:focus-visible`), 폼 요소는 `0 0 0 3px rgba(176, 73, 31, 0.12)`.

### 2.2 라운드(Radius)

| 토큰 | 값 | 용도 |
| --- | --- | --- |
| `--radius-sm` | `8px` | 작은 버튼·입력·배지 |
| `--radius-md` | `12px` | 행·리스트 아이템·중간 카드 |
| `--radius-lg` | `18px` | 큰 카드·섹션·모달·채팅 영역 |
| (pill) | `999px` | 알약형 버튼·아바타·아이콘 원·검색바 |

### 2.3 그림자(Shadow)

| 토큰 | 값 | 용도 |
| --- | --- | --- |
| `--shadow-sm` | `0 1px 2px rgba(87,62,38,.06)` | 카드 기본 |
| `--shadow-md` | `0 12px 28px -14px rgba(87,62,38,.28)` | hover·모달·강조 |

> 그림자는 **깊이를 살짝 암시하는 정도**로만 사용합니다. 아이콘·말풍선 등 작은 요소에 유광/입체 그림자를 넣지 않습니다(플랫 2D 원칙).

### 2.4 모션

- 표준 트랜지션: `--transition: 160ms ease`.
- hover 상승: `transform: translateY(-1px ~ -2px)`.
- 색/배경 전환 위주로 절제해서 사용(과한 scale·bounce 지양).

### 2.5 타이포그래피

- 폰트: `Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`.
- 렌더링: `text-rendering: optimizeLegibility`, `-webkit-font-smoothing: antialiased`.
- 기본 `line-height: 1.5`.
- 굵기: 본문 `600`, 강조/제목 `700~800`.
- 제목은 음수 자간(`letter-spacing: -0.01em ~ -0.02em`)으로 또렷하게.
- 반응형 크기는 `clamp()`로 (예: 히어로 타이틀 `clamp(30px, 5vw, 46px)`).

---

## 3. 레이아웃

- **App shell**: `.shell` — `max-width: 1180px`, 좌우 패딩 `clamp(14px, 4vw, 48px)`, 중앙 정렬.
- **헤더**: `.header` — `sticky` 상단 고정, surface 배경 + 하단 보더.
- **섹션 카드**: `.section` — surface 배경, `--radius-lg`, `--shadow-sm`, 내부 패딩 `clamp(16px, 3vw, 24px)`.
- **2단 컬럼**: `.twoColumn` — `minmax(0, 1.15fr) / minmax(320px, 0.9fr)` 그리드, 모바일에서 1단.

### 반응형 브레이크포인트

| 폭 | 주요 변화 |
| --- | --- |
| `≤ 720px` | 헤더 재배치, 카테고리 카드 2열, 탭 가로 스크롤, 히어로 축소 |
| `≤ 480px` | 카테고리 그리드 1열(채팅 위젯 등) |
| `≤ 420px` | shell 좌우 패딩 축소, 큰 버튼 그리드 1열 |

---

## 4. 마스코트(문무니)

- 파일: [`src/assets/munmuni-mascot.png`](../src/assets/munmuni-mascot.png) (양 얼굴, 투명 배경).
- **홈 히어로**: 큰 마스코트 + 말풍선("무엇이 궁금하신가요?"), 뒤에 반투명 원형 배경.
- **채팅 아바타**: `accent-soft` 원(36–42px) 안에 마스코트를 `width:150%`로 확대·`translateY(6%)`로 얼굴 중앙 정렬.
- **채팅 환영 화면**: 128px 마스코트 + 환영 문구를 중앙 배치(이때만 은은한 drop-shadow 허용).
- 마스코트는 브랜드 아이덴티티이므로 색을 바꾸거나 찌그러뜨리지 않습니다.

---

## 5. 아이콘

- 스타일: **얇은 라인(스트로크) SVG**, `stroke-width: 1.8`, `stroke-linecap/linejoin: round`, `fill: none`, `currentColor` 상속.
- 카테고리 아이콘 매핑: [`src/components/categoryIcons.tsx`](../src/components/categoryIcons.tsx) — label 키워드로 매칭(전과=교환, 수강신청=달력, 휴학=가방, 복학=학사모, 장학=메달, 졸업/기타=문서).
- **아이콘 컨테이너(`.categoryCardIcon`)는 플랫 2D**:
  - 배경 `accent-soft` 단색 원, 아이콘 색 `accent`.
  - hover 시 원이 `accent`로 채워지고 아이콘이 흰색으로 전환.
  - ⚠️ 유광 그라데이션·inset/드롭 그림자·scale 확대는 사용하지 않음(과거 제거됨).

---

## 6. 컴포넌트 패턴

### 6.1 버튼

- **Primary 버튼**: `--color-primary` 배경 + 흰 글자, `--radius-sm`, `font-weight: 700`, hover 시 `--color-primary-hover`.
- **알약형/아웃라인 버튼**(공지·탭 등): surface 배경 + 보더, hover 시 primary 테두리·글자.
- **탭(`.tabs button`)**: 선택 시 `.activeTab`(primary 배경, 흰 글자). 모바일에서 가로 스크롤.
- **원형 아이콘 버튼**: 검색·전송은 `accent` 원형 + 화살표 SVG(hover 시 primary).

### 6.2 카드

- **카테고리 카드(`.categoryCard`)**: surface + `--radius-lg` + `--shadow-sm`, 세로 정렬(아이콘 원 → 제목 → 설명). hover 시 primary 테두리 + `--shadow-md` + `translateY(-2px)`.
- **전화 CTA(`.phoneCta`)** 등 클릭 가능한 카드도 동일한 hover 상승 패턴.

### 6.3 리스트 (구분선 스타일)

박스 나열 대신 **구분선 + hover 하이라이트**를 표준으로 씁니다.

- **지금 많이 묻는 질문(`.questionRow`)**: 하단 보더로 행 구분, `[카테고리 배지 | 질문 | 화살표]` 그리드. hover 시 `accent-soft` 배경 + 질문 primary + 화살표(`›`) 슬라이드 인.
- **원문 공지(`.noticeList li`)**: 하단 보더 + 앞쪽 `accent` 점 마커. hover 시 `accent-soft` 배경 + 제목 primary + 점이 primary로 커짐.
- 마지막 항목은 `:last-child`로 보더 제거.

### 6.4 배지

- **카테고리 배지(`.questionBadge`)**: `accent-soft` 배경 + `primary` 글자, `radius: 8px`, `font-weight: 700`. 회색 배지 대신 강조색으로 눈에 띄게.
- **상태 배지(`mark.pending / mark.answered`)**: pending=연빨강, answered=연초록(관리자 테이블용).

### 6.5 폼

- 입력(`input/textarea/select`): surface 배경 + 보더 + `--radius-sm`, 포커스 시 primary 보더 + soft 링.
- **검색/전송 바**: 알약형 컨테이너(`border-radius: 999px`) 안에 투명 입력 + 원형 액션 버튼. `:focus-within`으로 컨테이너 강조.

### 6.6 모달

- `.modalBackdrop`: `rgba(45,34,24,.45)` + `backdrop-filter: blur(2px)`.
- `.modal`: surface, `--radius-lg`, `--shadow-md`, `max-width: 420px`.
- 액션 버튼은 하단 정렬(`.modalActions`), 취소는 muted 톤.

**체크리스트 모달(`.checklistModal`)** — 홈 카테고리 카드를 누르면 열리는 '신청 전 체크리스트'.

- 구조: 헤더(카테고리 아이콘 원 + eyebrow 라벨 + 제목 + 원형 닫기 버튼) → 진행률 바 → 스크롤 본문 → 하단 액션. 헤더/푸터는 고정되고 본문만 스크롤(`max-height: min(660px, 100vh - 48px)`).
- 항목은 §6.3 리스트 규칙대로 **구분선 + hover(`accent-soft`) 하이라이트**, 클릭하면 체크 토글(체크 시 박스가 primary로 채워짐 + 라벨 muted).
- 진행률: `accent` 채움 바 + `n/총계 확인` 텍스트(전부 체크 시 "모두 확인 완료").
- 모션: 백드롭 페이드 인 + 모달 `translateY(8px)` 상승(`prefers-reduced-motion`에서 비활성).
- `≤ 520px`에서는 화면 하단에 붙는 **바텀 시트**(아래 모서리 각지게, 액션 버튼 가로 꽉 채움).
- 열려 있는 동안 배경 스크롤 잠금, 닫기 버튼으로 포커스 이동 후 닫으면 원래 요소로 복원. Esc·배경 클릭으로 닫힘.

---

## 7. 채팅 페이지 (`/chat`)

문무니의 핵심 화면. GPT식 중앙 대화 레이아웃.

- **헤더 카드**: 뒤로가기 + 마스코트 아바타 + "문무니 AI 상담" 타이틀/상태 문구 + "상담사 연결" 버튼(accent 알약).
- **카테고리 툴바**: 헤더 아래 별도 바에서 학사 항목 선택.
- **메시지 영역(`.chatPageMessages`)**: surface + 은은한 우상단 accent 방사형 그라데이션.
  - AI/봇/상담사 → 좌측, 마스코트(또는 "상담" 배지) 아바타 + 말풍선(`.chatBubbleBot`, 크림 배경 + 보더).
  - 학생 → 우측 말풍선(`.chatBubbleUser`, primary 배경 + 흰 글자).
  - 발신자 라벨은 소형 대문자 태그(`.chatBubbleTag`).
  - 타이핑 인디케이터: 마스코트 아바타 + 점 3개 깜빡임.
- **빈 상태**: 마스코트 + "무엇이든 물어보세요!" 중앙 환영 화면.
- **컴포저**: "추천 질문" 라벨 + 알약형 추천 질문 목록 + 알약형 입력바(원형 accent 전송 버튼).

---

## 8. 접근성

- 색 대비: 본문/보조 텍스트는 크림 배경 위에서 충분한 대비 유지.
- 포커스: `:focus-visible`로 키보드 포커스 링 노출.
- 아이콘 전용 버튼에는 `aria-label`, 장식 아이콘에는 `aria-hidden="true"`.
- 상태 배지 등 색으로만 구분되는 정보는 텍스트 라벨을 함께 제공.

---

## 9. 사용 가이드(요약)

- ✅ 정의된 토큰(color/radius/shadow/transition)만 사용한다.
- ✅ 리스트는 구분선 + hover 하이라이트, 강조는 accent 계열로.
- ✅ 아이콘·작은 요소는 플랫 2D 유지.
- ❌ 유광 그라데이션, 과한 입체/유광 그림자, 임의의 색·라운드 값.
- ❌ 마스코트 변형(색 변경, 비율 왜곡).
