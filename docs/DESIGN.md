# 문무니(Munmuni) 디자인 가이드

강남대학교 학사 안내 서비스 **문무니**의 UI 디자인 시스템 문서입니다.
브랜드 마스코트(양 "문무니")를 중심으로 한 **따뜻한 크림·앰버 팔레트**, 큰 라운드(24px), 넓게 퍼지는 옅은 그림자를 기본 언어로 사용합니다.

> 코드에서 추출한 문서입니다. 기준 파일
> - 전역 토큰: [`src/index.css`](../src/index.css)
> - 컴포넌트 스타일 전체: [`src/App.module.css`](../src/App.module.css) (CSS Module, 단일 파일)
> - 화면: [`src/pages/`](../src/pages/) · 공통 컴포넌트: [`src/components/`](../src/components/)

---

## 1. 디자인 원칙

1. **따뜻하고 친근하게** — 딱딱한 행정 서비스가 아니라, 마스코트가 안내하는 다정한 톤.
2. **플랫 2D + 옅은 확산 그림자** — 유광 그라데이션·입체 그림자 대신, 단색 면 + 얇은 테두리 + 크게 퍼지는 저채도 그림자.
3. **정보가 눈에 잘 띄게** — 회색 박스 나열 대신, 강조색 배지·구분선·hover 하이라이트로 위계를 만든다.
4. **역할별 색 구분** — AI 상담은 **앰버**, 상담사(사람) 상담은 **블루**. 두 대화를 색으로 즉시 구분한다.
5. **일관된 라운드와 여백** — 정해진 radius/shadow 토큰만 사용해 화면 전체가 하나의 시스템으로 읽히게.

---

## 2. 디자인 토큰

토큰은 **4개 스코프**로 나뉘어 있습니다. 전역(`:root`) → 홈(`.shellHome`) → 채팅(`.chatLayout`) → 전화번호부(`.directoryPage`) 순으로 덮어씁니다.

### 2.1 전역 팔레트 (`:root`, index.css) — 서브 페이지 기준

공지·검색 등 홈/채팅이 아닌 화면에서 쓰이는 **테라코타 계열** 기본값입니다.
(전화번호부는 §2.4의 `.directoryPage`에서 앰버로 재정의합니다.)

| 토큰 | 값 | 용도 |
| --- | --- | --- |
| `--color-bg` | `#fffdf9` | 페이지 배경(크림) |
| `--color-surface` | `#ffffff` | 카드·헤더·입력 표면 |
| `--color-text` | `#2b241e` | 본문 텍스트 |
| `--color-text-muted` | `#857567` | 보조 텍스트·메타 정보 |
| `--color-border` | `#ece2d6` | 테두리·구분선 |
| `--color-primary` | `#b0491f` | 주요 액션·강조(테라코타) |
| `--color-primary-hover` | `#8f3a17` | primary hover |
| `--color-accent` | `#e08a3c` | 포인트(주황)·아이콘·점 마커 |
| `--color-accent-soft` | `#fbeede` | 강조 배경(배지·아이콘 원·hover 하이라이트) |

### 2.2 홈 팔레트 (`.shellHome`) — 2026 리디자인

홈 화면은 같은 토큰 이름을 **앰버 톤으로 재정의**해, 동일한 컴포넌트가 홈에서는 앰버로 보이게 합니다.

| 토큰 | 값 |
| --- | --- |
| `--color-text` | `#221d18` |
| `--color-text-muted` | `#817b75` |
| `--color-border` | `#eee9e3` |
| `--color-primary` | `#ec9f19` |
| `--color-primary-hover` | `#d98b0b` |
| `--color-accent` | `#ffb52e` |
| `--color-accent-soft` | `#fff5df` |
| `--radius-lg` | `24px` |
| `--shadow-sm` | `0 12px 32px rgba(75, 59, 39, 0.055)` |
| `--shadow-md` | `0 24px 56px rgba(237, 166, 50, 0.16)` |

### 2.3 채팅 팔레트 (`.chatLayout`) — AI 앰버 / 상담사 블루

| 토큰 | 값 | 용도 |
| --- | --- | --- |
| `--chat-ink` | `#211c17` | 제목·본문 |
| `--chat-ink-soft` | `#5f5a55` | 보조 텍스트 |
| `--chat-ink-muted` | `#8b8782` | 미리보기·설명 |
| `--chat-line` | `#eee9e3` | 카드 테두리·스크롤바 |
| `--chat-line-soft` | `#f5f0e9` | 패널 내부 구분선 |
| `--chat-radius` | `24px` | 채팅 카드 라운드 |
| `--chat-shadow` | `0 16px 40px rgba(75, 59, 39, 0.055)` | 채팅 카드 그림자 |
| `--chat-amber` / `-deep` / `-soft` / `-line` | `#ffb52e` / `#e99d16` / `#fff6e3` / `#ffe1a8` | **AI 상담** |
| `--chat-blue` / `-deep` / `-soft` / `-line` | `#4aa7ec` / `#2f96e4` / `#e8f4ff` / `#c9e4fa` | **상담사 상담** |

### 2.4 전화번호부 팔레트 (`.directoryPage`)

전화번호부도 홈과 같은 **앰버**로 읽히게 토큰을 재정의합니다. 다만 `--color-primary`는 홈 값(`#ec9f19`)을 그대로 쓰면 흰 배경 위 본문 대비가 부족하므로, **텍스트·보더용 진한 앰버 잉크**로 따로 잡습니다.

| 토큰 | 값 | 비고 |
| --- | --- | --- |
| `--color-primary` | `#9a6608` | 앰버 잉크. 흰 배경 대비 4.9:1 |
| `--color-primary-hover` | `#7f5406` | |
| `--color-accent` | `#ffb52e` | 면으로 채우는 CTA(활성 탭, 전화 알약) |
| `--color-accent-soft` | `#fff5df` | |
| `--color-text` / `-muted` / `--color-border` | `#221d18` / `#817b75` / `#eee9e3` | 홈과 동일 |
| `--radius-lg` / `--shadow-sm` / `--shadow-md` | 홈과 동일(24px, 옅은 확산 그림자) | |

- **앰버 면 위 글자는 진한 갈색 `#3a2703`** (약 8:1). 활성 탭·전화 알약 모두 흰 글자를 쓰지 않습니다.
- 다른 서브 페이지(공지·검색)는 아직 §2.1 테라코타입니다. 함께 맞추려면 이 토큰 블록을 공용 클래스로 분리하세요.

### 2.5 라운드(Radius)

| 토큰 | 값 | 용도 |
| --- | --- | --- |
| `--radius-sm` | `8px` | 작은 버튼·입력·배지 |
| `--radius-md` | `12px` | 행·리스트 아이템·중간 카드 |
| `--radius-lg` | `18px` (홈 `24px`) | 큰 카드·섹션·모달 |
| `--chat-radius` | `24px` | 채팅 카드 |
| (말풍선) | `20px` + 꼬리쪽 `6px` | 봇은 왼쪽 아래, 학생은 오른쪽 아래를 좁힌다 |
| (segment) | `14px` 컨테이너 / `10px` 아이템 | 세그먼트 탭 |
| (pill) | `999px` | 알약형 버튼·아바타·아이콘 원·검색바 |

### 2.6 그림자(Shadow)

| 이름 | 값 | 용도 |
| --- | --- | --- |
| `--shadow-sm` | `0 1px 2px rgba(87,62,38,.06)` | 카드 기본(서브 페이지) |
| `--shadow-md` | `0 12px 28px -14px rgba(87,62,38,.28)` | hover·모달 |
| 홈 카드 | `0 14px 30px rgba(75,59,39,.075)` → hover `0 22px 40px rgba(75,59,39,.11)` | 카테고리 카드 |
| 앰버 액션 | `0 8px 18px rgba(242,164,29,.22)` | 전송·검색·새 대화 버튼 |
| 앰버 입력바 | `0 20px 52px rgba(240,171,53,.16)` / 채팅 `0 14px 34px rgba(240,171,53,.14)` | 히어로 검색바, 채팅 입력창 |

### 2.7 모션

- 표준 트랜지션: `--transition: 160ms ease`.
- hover 상승: `translateY(-1px ~ -2px)` (홈 카테고리 카드만 `-4px`).
- 마스코트 부유: `heroMascotFloat 3.8s ease-in-out infinite` (모바일은 `heroMascotFloatMobile`).
- 귀 흔들기 오버레이: `mascotOverlayLeftEar 5.8s` / `mascotOverlayRightEar 6.1s` — 대부분 시간은 `opacity: 0`이고 주기 후반에만 잠깐 나타난다.
- 타이핑 점: `chatBlink 1.2s`, 두 번째·세 번째 점에 `0.2s`/`0.4s` 지연.
- 모달: 백드롭 페이드 인(160ms) + 모달 `translateY(8px)` 상승(200ms), 모바일은 바텀 시트 `translateY(24px)`.
- `prefers-reduced-motion: reduce`에서 마스코트 애니메이션·모달 애니메이션 모두 비활성.

### 2.8 타이포그래피

- 기본 폰트: `Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`.
- **로고만 예외**: `"Malgun Gothic", "맑은 고딕", "NanumSquareRound", sans-serif` + `-webkit-text-stroke: 0.18px`.
- 렌더링: `text-rendering: optimizeLegibility`, `-webkit-font-smoothing: antialiased`, 기본 `line-height: 1.5`.
- 굵기: 본문 `500~600`, 강조 `700`, 제목/타이틀 `800`, 히어로 타이틀 `900`.
- **자간 규칙** — 제목은 좁게(`-0.035em ~ -0.055em`), 본문은 거의 그대로(`-0.005em ~ -0.02em`). 말풍선 본문은 `line-height: 1.7`로 읽기 우선.
- 반응형 크기는 `clamp()` (히어로 타이틀 `clamp(38px, 3.8vw, 52px)`, 모바일 고정 `30px`).
- 한국어 줄바꿈: 설명·안내 문구에 `word-break: keep-all`.

---

## 3. 레이아웃

| 컨테이너 | 값 | 용도 |
| --- | --- | --- |
| `.shell` | `max-width: 1180px`, `padding: 18px clamp(14px,4vw,48px) 56px` | 기본 페이지 |
| `.shellHome` | `max-width: 1120px`, `padding: 8px clamp(20px,4vw,54px) 80px` | 홈(토큰 재정의 포함) |
| `.shellFull` | `max-width: 1600px`, `overflow: hidden` | 채팅(페이지 스크롤 없음) |
| `.chatLayout` | `max-width: 1180px`, `display: flex`, `gap: 20px` | 기록 패널 + 채팅 |
| `.section` | surface, `--radius-lg`, `--shadow-sm`, `padding: clamp(16px,3vw,24px)` | 섹션 카드 |
| `.twoColumn` | `minmax(0,1.15fr) / minmax(320px,0.9fr)`, 높이 `460px` 고정 | 2단 목록(내부 스크롤 + `.pager`) |

**전체 높이 채팅 화면** — `Layout fullHeight`가 `<main>`에 `data-full-height` 속성을 달고, `index.css`의 `#root:has([data-full-height])`가 `height: 100dvh; overflow: hidden`을 걸어 페이지 자체 스크롤을 막습니다. 스크롤은 메시지 영역·기록 목록 내부에서만 발생합니다.

### 반응형 브레이크포인트

| 폭 | 주요 변화 |
| --- | --- |
| `≤ 960px` | 채팅 사이드 패널 숨김 → 오른쪽 **드로어**(320px)로 전환 |
| `≤ 860px` | 홈 카테고리 간격 축소, 인기 검색어 바 가로 스크롤 |
| `≤ 720px` | 헤더 압축(56px), 홈 카테고리 1열 가로형 카드, 탭 가로 스크롤, 공지 리스트 세로 정렬(점 마커 숨김), 입력 폰트 16px 고정(iOS 확대 방지) |
| `≤ 520px` | 체크리스트 모달·상담사 연결 모달이 **바텀 시트**로 전환 |
| `≤ 480px` | 채팅 위젯 전폭, 카테고리 그리드 1열 |
| `≤ 440px` | 헤더 여백·로고·검색바 추가 축소 |
| `≤ 420px` | shell 좌우 패딩 12px, 하단 88px 확보 |

---

## 4. 마스코트(문무니)

- 파일: [`src/assets/munmuni-mascot.png`](../src/assets/munmuni-mascot.png) (양 얼굴, 투명 배경).
- **홈 히어로** ([`AnimatedMascot.tsx`](../src/components/AnimatedMascot.tsx)) — PNG 위에 `viewBox="0 0 1024 1024"` SVG 오버레이를 겹친 구조.
  - **눈동자 추적**: `pointermove`로 커서를 따라 눈동자가 최대 `x ±4px`, `y ±2.5px` 이동(`transition: transform 120ms ease-out`). 포인터가 창을 벗어나면 원위치.
  - 눈 커버 `#f8f1e1`, 눈동자 `#171313`, 하이라이트 `rgba(255,255,255,.86)`.
  - **귀 흔들기**: `#fff9ec` 패스 2개가 주기적으로 살짝 나타나 회전.
  - 배경: 반투명 앰버 방사형 글로우(`440×310`), 좌우에 `✦` 스파클(`#ffbd35`, `text-shadow: 23px 23px 0 #ffc447`).
- **헤더 로고**: `68×60` 클리핑 박스 안에 `92px` 이미지를 `translateY(-4px)`로 얹어 얼굴만 보이게 자른다.
- **채팅 아바타**: `#fff3d8` 원(38px / 헤더 46px) 안에서 이미지를 `width: 150%`, `translateY(6%)`로 확대·정렬.
- **채팅 환영 화면**: 132px(모바일 96px) 마스코트 + 앰버 drop-shadow(이 화면에서만 허용).
- 마스코트는 브랜드 아이덴티티이므로 색을 바꾸거나 비율을 왜곡하지 않습니다.

---

## 5. 아이콘

- 스타일: **라인 SVG**, `stroke-width: 1.6~2.2`, `stroke-linecap/linejoin: round`, `fill: none`, `currentColor` 상속.
- 카테고리 아이콘 ([`categoryIcons.tsx`](../src/components/categoryIcons.tsx)) — label 키워드로 매칭: 전과/전부=교환 화살표, 수강=달력, 휴학=가방, 복학=학사모, 장학=메달, 졸업·그 외=문서(기본값).
  - 각 아이콘은 공통 `softShape`(투명도 0.14 배경 도형 + 0.28 하이라이트 호)를 깔고 그 위에 흰 면(`#fff`) 도형을 얹는 2겹 구성.
- 그 외: [`ChatIcon.tsx`](../src/components/ChatIcon.tsx)(말풍선), [`PhoneIcon.tsx`](../src/components/PhoneIcon.tsx)(`variant="cute"` 지원).
- **아이콘 컨테이너는 플랫 2D** — 단색 원 배경 + 강조색 아이콘, hover 시 배경·아이콘 색만 진하게. 유광 그라데이션·inset 그림자·scale 확대는 사용하지 않습니다.

---

## 6. 컴포넌트 패턴

### 6.1 헤더 ([`Header.tsx`](../src/components/Header.tsx))

- `sticky top: 0`, `z-index: 10`, 배경 `rgba(255,253,250,.94)`, **하단 보더 없음**, `min-height: 92px`(모바일 56px).
- 좌측 로고: 마스코트 + `문무니`(25px/700) + 1px 디바이더(`#ded8d1`) + `AI 학사 문의 도우미`(15px/500). 모바일에서 디바이더·서브텍스트는 숨김.
- 우측 `.headerActions`: 50px 원형 `.menuButton` 2개(채팅 기록, 전화번호부). 배경 `#fff4db`, 보더 `#ffe3a9`, 아이콘 `#eda529`, hover 시 진해지며 `-2px` 상승.

### 6.2 버튼

| 종류 | 스타일 |
| --- | --- |
| Primary | `--color-primary` 배경 + 흰 글자, `--radius-sm`, `700`, hover `--color-primary-hover` |
| 앰버 액션(원형) | `linear-gradient(145deg,#ffc550,#ffad1f)` + 앰버 그림자, hover `#ffbc35→#f19b0c` + `-1px`. 히어로 검색(58px), 채팅 전송(50px) |
| 알약 아웃라인 | surface + 보더, hover 시 primary 테두리·글자 |
| 세그먼트 탭 | `#fffaf0` 컨테이너(radius 14, padding 6) 안 radius 10 아이템, 활성 `#ffb52e` 배경 + 흰 글자 |
| Ghost | surface + 보더 + muted 글자, hover 시 primary (모달 '닫기') |
| 위험 확인 | `#fdeceb` / 보더 `#f4c9c4` / 글자 `#c0442f` (기록 초기화 확인) |
| disabled | `opacity: .35~.6`, `cursor: default`, 그림자 제거 |

### 6.3 카드

- **홈 카테고리 카드(`.categoryCard`)**: radius 23px, `min-height: 238px`, 세로 정렬(아이콘 원 70px → 제목 20px/800 → 설명 14.5px). hover 시 보더 `#ffd98f` + 그림자 확대 + `translateY(-4px)`.
  - 아이콘 원 색은 `data-category`로 분기: 기본 앰버(`#fff3d8`/`#f9b132`), `course` 블루(`#e8f4ff`/`#4aa7ec`), `leave` 그린(`#e5f6ea`/`#4dbb74`).
  - 한 페이지 3장([`TopTabs.tsx`](../src/components/TopTabs.tsx) `PAGE_SIZE = 3`), 초과 시 좌우 44px 원형 화살표로 페이지 전환.
  - `≤720px`: `grid-template-columns: 44px minmax(0,1fr)`의 가로형 행(`min-height: 76px`)으로 변형.

### 6.4 리스트 (구분선 스타일)

박스 나열 대신 **구분선 + hover 하이라이트**를 표준으로 씁니다. 마지막 항목은 `:last-child`로 보더 제거.

- **질문/전화 행(`.questionRow`)**: 하단 보더, `[배지 | 제목 | 우측 요소]` 그리드. hover 시 `accent-soft` 배경 + 제목 primary + 화살표(`›`) 슬라이드 인.
- **원문 공지(`.noticeList li`)**: 하단 보더 + 앞쪽 `accent` 6px 점 마커. hover 시 배경 하이라이트 + 제목 primary + 점이 primary로 `scale(1.3)`. 제목은 2줄 클램프, 우측에 조회수·날짜(`·` 구분).
- **전화번호부(`.directorySection`)**: 그룹 헤더(제목 + 개수 알약 배지) + 그룹별 행 목록, 행 우측에 앰버 알약 `.directoryCallBadge`(`tel:` 링크).
  - 전화번호가 이 페이지의 핵심 정보이므로 **가장 눈에 띄는 요소**로 둔다: `#ffb52e` 면 + `#3a2703` 글자 + 앰버 그림자, `14.5px/800`, `font-variant-numeric: tabular-nums`, `min-height: 40px`(터치 영역).
  - `≤720px`에서도 번호는 줄이지 않고(`14px`) 업무명만 줄바꿈(`word-break: keep-all`)으로 흘린다.

### 6.5 배지

- **카테고리 배지(`.questionBadge`)**: `accent-soft` 배경 + `primary` 글자, radius 8px, `700`.
- **개수 배지**: `accent-soft` 알약 + primary 글자(전화번호부 그룹, 채팅 기록 개수).
- **종류 배지(`.chatHistoryKind`)**: AI = 앰버(`#fff6e3`/`#b8790a`), 상담사 = 블루(`#e8f4ff`/`#1f7ec4`).
- **상태 배지(`mark.pending / .answered`)**: pending 연빨강(`#fee2e2`/`#b91c1c`), answered 연초록(`#dcfce7`/`#15803d`).

### 6.6 폼

- 입력(`input/textarea/select`): surface + 보더 + `--radius-sm`, 포커스 시 primary 보더 + `0 0 0 3px rgba(176,73,31,.12)` 링.
- **검색/전송 바**: 알약 컨테이너(`999px`) 안에 투명 입력 + 원형 그라데이션 버튼. `:focus-within`으로 컨테이너 강조. 히어로 `min-height: 90px`, 채팅 입력창 `min-height: 66px`.
- **오류/경고 문구(`.fieldMessage`)**: `min-height: 18px`로 자리를 미리 잡아 문구 유무에 따라 레이아웃이 흔들리지 않게 한다. 오류 `#c0392b` + `aria-invalid`, 경고는 muted 색(제출은 막지 않음).

### 6.7 모달

- `.modalBackdrop`: `rgba(45,34,24,.45)` + `backdrop-filter: blur(2px)`, `z-index: 30`.
- `.modal`: surface, `--radius-lg`, `--shadow-md`, `max-width: 420px`(체크리스트 540px).
- 액션은 하단 우측 정렬(`.modalActions`), 취소는 muted 톤.

**체크리스트 모달(`.checklistModal`)** — 홈 카테고리 카드를 누르면 열리는 '신청 전 체크리스트'.

- 구조: 헤더(카테고리 아이콘 원 48px + eyebrow 라벨 + 제목 + 원형 닫기 32px) → 진행률 바 → 스크롤 본문 → 하단 액션. 헤더/푸터 고정, 본문만 스크롤(`max-height: min(660px, 100vh - 48px)`).
- 항목은 §6.4 규칙대로 구분선 + hover 하이라이트, 클릭하면 체크 토글(박스가 primary로 채워지고 라벨은 muted로 흐려짐, `aria-pressed`).
- 진행률: `accent` 채움 바(`role="progressbar"`) + `n/총계 확인`, 전부 체크 시 "모두 확인 완료".
- 액션: `닫기`(ghost) / `AI에게 물어보기`(primary → `/chat` 이동).
- `≤520px`에서 바텀 시트(아래 모서리 각지게, 버튼 가로 꽉 채움, `max-height: 86vh`).
- 열려 있는 동안 배경 스크롤 잠금, 열 때 닫기 버튼으로 포커스 이동 후 닫으면 원래 요소로 복원. Esc·배경 클릭으로 닫힘.

---

## 7. 홈 화면 (`/`)

위에서 아래로: **히어로 → 카테고리 카드 → 인기 검색어 바 → 하단 콘텐츠**.

- **히어로**: 타이틀 `문의할게 무니?`(강조어 `#ffb52e`) + 서브카피 → 마스코트 + 스파클 → 큰 검색바. 검색 제출은 `/chat?q=...`로 이동(검색 페이지가 아니라 **채팅으로 직행**).
- **카테고리 카드**: §6.3. 카드 클릭 → 체크리스트 모달.
- **인기 검색어 바(`.popularSearches`)**: 반투명 흰 알약 바. `✦ 많이 찾는 검색어` 라벨 + 1px 디바이더 + `# 키워드` 링크들(`justify-content: space-evenly`) + `더보기 ›`. 키워드는 [`constants.ts`](../src/constants.ts)의 `popularSearchKeywords` — 채팅 첫 화면 추천 질문과 **같은 목록을 공유**한다. 모바일에서는 세로 배치 + 가로 스크롤, `더보기`는 숨김.
- **하단 콘텐츠(`.homeLowerContent`)**: radius 24 / 옅은 그림자 섹션 2개.
  1. **지금 많이 묻는 질문** — 세그먼트 카테고리 탭 + FAQ 아코디언(페이지당 5개, 하단 이전/다음). 열린 답변은 `#fffaf1` radius 14 블록.
  2. **자주 찾는 원문 공지** — 조회수 상위 10건 구분선 리스트 + `더보기`(`/notices`).

---

## 8. 채팅 페이지 (`/chat`)

문무니의 핵심 화면. 좌측 기록 패널 + 우측 대화 3단(헤더 / 메시지 / 컴포저) 구성이며, **AI = 앰버 / 상담사 = 블루** 규칙이 전 요소에 일관되게 적용됩니다.

### 8.1 기록 패널 ([`ChatHistoryPanel.tsx`](../src/components/ChatHistoryPanel.tsx))

- 폭 292px 카드, 헤더 고정 + 목록만 내부 스크롤(얇은 스크롤바 `--chat-line`).
- 헤더: `이전 채팅 기록` + 개수 알약 배지 + `새 대화` 앰버 그라데이션 알약.
- 세그먼트 탭: `전체 / AI 채팅 / 상담사 채팅` (각 탭에 건수 표시).
- 항목: 제목(첫 질문, 1줄 클램프) + 시각 / 아래 줄에 최근 메시지 미리보기. 선택된 항목은 **왼쪽 3px 액센트 바** + soft 배경 + 제목 색 강조(AI 앰버 / 상담사 블루). `전체` 탭에서만 종류 배지 표시.
- 하단: `기록 초기화` — 같은 자리에서 한 번 더 확인받고, 확인 버튼만 경고색.
- `≤960px`: 패널을 숨기고 헤더의 채팅 아이콘으로 여는 **오른쪽 드로어**(320px, 백드롭 `rgba(43,36,30,.3)`, `box-shadow: -18px 0 42px`)로 전환.

### 8.2 대화 영역

- **헤더 카드**: 뒤로가기(42px, radius 14) + 아바타 + 대화 제목(첫 질문, 1줄 클램프)·상태 문구 + 우측 액션.
  - AI: `상담사 연결` 버튼(블루 알약 — 연결될 톤을 미리 보여준다).
  - 상담사 모드: `상담사 연결됨` 배지(블루 점 + 텍스트), 카드에 `inset 3px 0 0 blue` 왼쪽 바 + 블루 보더.
- **메시지 영역(`.chatPageMessages`)**: surface + 우상단 앰버 방사형 그라데이션(`rgba(255,181,46,.09)`), 얇은 스크롤바.
  - 봇/AI/상담사 → 좌측(`.chatRowBot`, `max-width: min(92%,720px)`), 아바타 + 말풍선. 학생 → 우측(`.chatRowUser`, `min(88%,640px)`).
  - AI 말풍선: `#fff9ef` + 보더 `#f1e5d3`. 상담사 말풍선: `#f4faff` + 보더 `#dbecf8`. 학생 말풍선: `linear-gradient(145deg,#ffce62,#ffb833)` + 글자 `#2f1f02`.
    > 앰버 위 흰 글자는 대비가 약 2:1로 떨어지므로 **진한 갈색 글자**를 씁니다(현재 조합 약 9:1).
  - 발신자 라벨(`.chatBubbleTag`): 11.5px/800, AI `#a76f08` / 상담사 `#1a6fae`.
  - 타이핑 인디케이터: 마스코트 아바타 + 앰버 점 3개 순차 깜빡임.
- **빈 상태**: 마스코트 132px + `무엇이든 물어보세요!` + 안내 문구 + `✦ 많이 찾는 질문` 알약 목록(홈과 동일 키워드). 상담사 전용 채팅은 마스코트 대신 블루 `상담` 배지 76px + 전용 안내 문구.
- **컴포저**: 알약 입력바 + 50px 앰버 그라데이션 전송 버튼. placeholder도 모드별로 다르다.

### 8.3 상담사 연결 모달 (`.escalateModal`)

학번(숫자 고정 자릿수, `inputMode="numeric"`)·학과(`datalist` 자동완성)·이름 3개 필드. 필드별 오류/경고 문구 자리를 고정(`.fieldMessage`)하고, 제출 버튼은 세 값이 모두 있을 때만 활성. 완료 시 AI 대화와 **별개의 상담사 전용 채팅**이 새로 열립니다.

- **색은 홈 화면과 같은 앰버**입니다. 채팅 레이아웃 밖에서 열려 `--chat-*`가 닿지 않으므로 자체 토큰(`--esc-amber` `#ffb52e` / `-deep` `#ec9f19` / `-soft` `#fff5df` / `-line` `#ffe1a8` / `-ink` `#9a6608`)을 둡니다.
  - 카드: 앰버 보더 + **왼쪽 3px 앰버 바**(`inset 3px 0 0`) + `0 24px 56px rgba(237,166,50,.18)`, radius 24.
  - 입력 포커스: `--esc-amber-deep` 보더 + `rgba(242,164,29,.18)` 링. 오류(`aria-invalid`) 상태에서는 빨강이 그대로 유지됩니다.
  - `취소`는 ghost, `상담사 채팅 열기`는 **홈 히어로와 같은 앰버 액션**(`linear-gradient(145deg,#ffc550,#ffad1f)` + 글자 `#3a2703` + 앰버 그림자, hover `-1px`).
  - 참고: 채팅 헤더의 `상담사 연결` 버튼과 연결 후 대화 UI는 여전히 **블루**입니다(§8.2). 모달만 홈 톤을 씁니다.
- `≤520px`에서 체크리스트 모달과 같은 **바텀 시트**로 전환 — 아래 모서리 각지게, 상단 3px 앰버 바, `max-height: 88vh` + 내부 스크롤, 버튼 가로 꽉 채움(`padding: 14px`), `env(safe-area-inset-bottom)` 확보.

---

## 9. 접근성

- **색만으로 구분하지 않는다** — AI/상담사 구분은 색 + 배지 텍스트(`AI`/`상담`) + 안내 문구를 함께 제공.
- 대비: 앰버 배경 위에는 흰 글자 대신 진한 갈색(§8.2). 본문·보조 텍스트는 크림 배경에서 충분한 대비 유지.
- 포커스: 전역 `:focus-visible`(2px primary, offset 2), 폼은 soft 링 추가. 모달은 열 때 포커스 이동 → 닫을 때 원래 요소로 복원.
- 모달/드로어: `role="dialog"`, `aria-modal`, `aria-labelledby`, Esc·배경 클릭 닫기, 배경 스크롤 잠금.
- 아이콘 전용 버튼·링크에 `aria-label`, 장식 요소에 `aria-hidden="true"`, 토글에 `aria-pressed`, 진행률에 `role="progressbar"` + `aria-valuenow`.
- 입력 오류는 `aria-invalid` + `aria-describedby`로 메시지 연결.
- `prefers-reduced-motion: reduce`에서 마스코트·모달 애니메이션 정지.
- `≤720px`에서 입력 폰트 16px 고정(iOS 자동 확대 방지), 숫자는 `font-variant-numeric: tabular-nums`.

---

## 10. 사용 가이드(요약)

- ✅ 정의된 토큰(color/radius/shadow/transition)만 사용한다. 홈·채팅에서 색이 달라지는 것은 **토큰 재정의**로 처리하고, 컴포넌트에 색을 하드코딩하지 않는다.
- ✅ 리스트는 구분선 + hover 하이라이트, 강조는 accent 계열로.
- ✅ AI는 앰버, 상담사는 블루. 새 UI를 추가할 때도 이 구분을 유지한다.
- ✅ 아이콘·작은 요소는 플랫 2D, 그림자는 넓고 옅게.
- ✅ 한국어 문구에는 `word-break: keep-all`, 긴 제목은 1~2줄 클램프.
- ❌ 유광 그라데이션(앰버 액션 버튼의 2색 그라데이션은 예외), 과한 입체 그림자, 임의의 색·라운드 값.
- ❌ 앰버/블루 배경 위 흰 본문 텍스트(대비 부족).
- ❌ 마스코트 변형(색 변경, 비율 왜곡).

---

## 부록. 미사용(레거시) 스타일

`App.module.css`에는 현재 화면에서 참조되지 않는 블록이 남아 있습니다. 새 작업의 참고 기준으로 삼지 말고, 정리 대상으로 봐 주세요.

- 플로팅 채팅 위젯: `.chatWidget`, `.chatToggle`, `.chatPanel`, `.chatHeader*`, `.chatBody`, `.chatIntro`, `.chatOptions`, `.chatModeCard`, `.chatCategoryCard`, `.chatQuickGrid`, `.chatEscalate` — 전용 `/chat` 페이지로 대체됨.
- 관리자/기타: `table` 계열, `.adminToolbar`, `.tableWrap`, `.callLogger`, `.largeButtonGrid`, `.noticePicker`, `.toast`, `.modeToggle`, `.searchForm`, `.rankRow`, `.phoneCta`, `.checklistPanel`/`.checklistRow`, `.contactList` 계열, `.twoColumn`, `.topTabs`(클래스명은 남아 있으나 `TopTabs` 컴포넌트는 `.categorySlider`를 사용), `.chatInfoPanel`/`.chatInfoBlock`.
