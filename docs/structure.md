# 프로젝트 구조 분석

> 📁 **Travel Proposal Design** - 피그마메이크(Figma Make)를 통해 생성된 여행 제안서 디자인 웹 앱

---

## 📋 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **프로젝트명** | Travel Proposal Design |
| **생성 도구** | Figma Make |
| **목적** | 여행 기획사(유니나투어)를 위한 고객 맞춤형 여행 제안서 생성 |
| **원본 피그마** | [Figma Design](https://www.figma.com/design/6S8qSDIR4ytJUSMzABRars/Travel-Proposal-Design) |

---

## 🛠️ 기술 스택

### 코어 프레임워크
- **React 18.3.1** - UI 프레임워크
- **TypeScript** - 정적 타입 지원
- **Vite 6.3.5** - 빌드 도구 및 개발 서버

### UI 라이브러리
- **Radix UI** - 접근성 기반 UI 컴포넌트 (~30개 패키지)
- **Tailwind CSS** - 유틸리티 기반 CSS 프레임워크
- **Lucide React** - 아이콘 라이브러리

### 기능 라이브러리
- **html2canvas** - DOM을 캔버스로 변환 (스크린샷 기능)
- **pptxgenjs** - PowerPoint 생성 (PPT 내보내기 지원 예정)
- **react-day-picker** - 날짜 선택 컴포넌트
- **date-fns** - 날짜 유틸리티
- **react-hook-form** - 폼 관리
- **embla-carousel-react** - 이미지 캐러셀

---

## 📂 디렉토리 구조

```
Travel Proposal Design/
├── 📄 index.html                    # 메인 HTML 엔트리
├── 📄 package.json                  # 프로젝트 의존성 정의
├── 📄 vite.config.ts               # Vite 빌드 설정
├── 📄 CLAUDE.md                    # AI 개발 지침
├── 📄 README.md                    # 프로젝트 설명
│
├── 📁 docs/                        # 문서 디렉토리
│   ├── 📄 structure.md             # 본 파일 (프로젝트 구조)
│   └── 📄 troubleshooting.md       # 배포/실행 문제 해결 기록
│
└── 📁 src/
    ├── 📄 main.tsx                 # React 앱 엔트리 포인트 (에러 바운더리 포함)
    ├── 📄 App.tsx                  # 메인 앱 컴포넌트 (핵심 로직)
    ├── 📄 index.css                # 글로벌 스타일
    │
    ├── 📁 assets/                  # 정적 리소스
    │   └── 🖼️ *.png                # 로고 등 이미지
    │
    ├── 📁 hooks/                   # 커스텀 React 훅 ⭐NEW
    │   ├── 📄 index.ts             # 훅 인덱스 (re-export)
    │   ├── 📄 useTourData.ts       # 투어 데이터 상태 관리
    │   ├── 📄 usePageConfigs.ts    # 페이지 설정 상태 관리
    │   ├── 📄 useBlurData.ts       # 블러 영역 상태 관리
    │   └── 📄 useAuth.ts           # 인증 상태 관리
    │
    ├── 📁 components/              # React 컴포넌트
    │   ├── 📁 figma/               # Figma 호환 컴포넌트
    │   │   └── 📄 ImageWithFallback.tsx
    │   │
    │   ├── 📁 ui/                  # Radix UI 기반 공통 컴포넌트 (40+ 파일)
    │   │   ├── 📄 button.tsx
    │   │   ├── 📄 card.tsx
    │   │   ├── 📄 dialog.tsx
    │   │   └── ...
    │   │
    │   ├── 📄 AppErrorBoundary.tsx # 최상단 렌더 오류 복구 UI
    │   └── 📄 페이지 컴포넌트들    # 비즈니스 로직 컴포넌트
    │       ├── 📄 CoverPage.tsx
    │       ├── 📄 IntroductionPage.tsx
    │       └── ... (총 18개)
    │
    ├── 📁 types/                   # TypeScript 타입 정의
    │   ├── 📄 tour-data.ts         # 여행 데이터 타입 (핵심)
    │   ├── 📄 blur-region.ts       # 블러 영역 타입
    │   └── 📄 text-style.ts        # 텍스트 스타일 타입
    │
    ├── 📁 styles/                  # 추가 스타일
    │   └── 📄 globals.css
    │
    ├── 📁 utils/                   # 유틸리티 함수 ⭐UPDATED
    │   ├── 📄 index.ts             # 유틸 인덱스 (re-export)
    │   ├── 📄 storage.ts           # 앱 네임스페이스/레거시 마이그레이션 포함 저장소 래퍼
    │   ├── 📄 export.ts            # JSON 내보내기/불러오기
    │   └── 📄 date-parser.ts       # 날짜 파싱 유틸
    │
    └── 📁 guidelines/              # 가이드라인 문서
        └── 📄 Guidelines.md
```

---

## 🎯 핵심 기능 분석

### 1. 🔐 비밀번호 보호 시스템
**파일**: `src/components/PasswordProtection.tsx`

- 세션 기반 인증 (sessionStorage 사용)
- 비밀번호는 `VITE_APP_PASSWORD` 환경변수 사용
- 인증 키는 `uninaplan:auth` 네임스페이스 사용
- 인증 상태 유지 (브라우저 탭 종료까지)

```typescript
// 인증 흐름
1. 앱 로드 → isAuthenticated = false
2. 비밀번호 입력 → 검증
3. 인증 성공 → sessionStorage에 `uninaplan:auth` 저장
4. 메인 앱 컨텐츠 표시
```

---

### 2. 📄 페이지 관리 시스템
**파일**: `src/App.tsx`

#### 지원하는 페이지 타입 (15종)

| 타입 | 컴포넌트 | 설명 |
|------|----------|------|
| `cover` | CoverPage | 표지 페이지 |
| `intro` | IntroductionPage | 여행 소개 |
| `process` | ProcessPage | 여행 진행 프로세스 |
| `flight-departure` | FlightDeparturePage | 항공편 (출발) |
| `flight-transit` | FlightTransitPage | 항공편 (중간이동) |
| `flight-arrival` | FlightArrivalPage | 항공편 (도착) |
| `itinerary` | ItineraryCalendarPage | 여행 일정 캘린더 |
| `accommodation` | EditableAccommodationPage | 숙소 안내 |
| `detailed-schedule` | DetailedSchedulePage | 세부 일정 |
| `tourist-spot` | TouristSpotListPage | 관광지 리스트 |
| `transportation-ticket` | TransportationTicketPage | 교통편 안내 |
| `transportation-card` | TransportationCardPage | 교통카드 안내 |
| `quotation` | QuotationPage | 견적서 |
| `payment` | PaymentPage | 결제 안내 |
| `flight` | FlightInfoPage | 항공편 정보 (레거시) |

#### 페이지 조작 기능
- ✅ 드래그 앤 드롭으로 페이지 순서 변경
- ✅ 페이지 복제 (깊은 복사)
- ✅ 페이지 삭제
- ✅ 좌우 화살표로 페이지 이동
- ✅ 도트 네비게이션

---

### 3. ✏️ 편집 모드 시스템
**관련 파일**: `StylePicker.tsx`, `ImageWithControls.tsx`

#### 보기 모드 ↔ 편집 모드 전환
- 편집 모드: 모든 텍스트/이미지 편집 가능
- 보기 모드: 최종 결과물 미리보기

#### 텍스트 스타일 편집기 (StylePicker)
```typescript
interface TextStyle {
  size: string;    // px 값 (예: "16px")
  weight: 'normal' | 'semibold' | 'bold';
  color: string;   // hex 코드 (예: "#000000")
}
```

기능:
- 폰트 크기 조절 (8px ~ 72px 슬라이더)
- 폰트 굵기 선택 (일반/중간/굵게)
- 색상 선택 (컬러 피커 + HEX 입력)
- 실시간 미리보기

#### 이미지 컨트롤러 (ImageWithControls)
- `object-fit` 조절: cover / contain / fill
- 드래그로 이미지 위치 조정 (object-position)
- 터치 지원

---

### 4. 🔲 블러 영역 기능
**파일**: `src/components/BlurOverlay.tsx`, `src/types/blur-region.ts`

```typescript
interface BlurRegion {
  id: string;
  x: number;      // 퍼센트 위치
  y: number;
  width: number;
  height: number;
  pageId: string;
}
```

기능:
- 드래그로 블러 영역 지정
- 민감한 정보 가리기 (가격, 개인정보 등)
- 블러 영역 우클릭으로 삭제
- PDF 출력 시에도 블러 유지 (SVG 필터 사용)
- localStorage에 자동 저장

---

### 5. 💾 데이터 영속성 시스템

#### 로컬 스토리지 자동 저장
```javascript
// 저장되는 데이터
- tourData: 전체 여행 데이터
- pageConfigs: 페이지 구성 및 순서
- blurData: 블러 영역 정보
```

#### 파일 내보내기/불러오기

| 기능 | 설명 |
|------|------|
| **사이트 저장** | 전체 tourData + pageConfigs를 JSON 파일로 다운로드 |
| **사이트 불러오기** | JSON 파일 업로드로 전체 상태 복원 |
| **페이지 저장** | 현재 페이지만 JSON 파일로 다운로드 |
| **페이지 불러오기** | JSON 파일의 페이지를 현재 위치에 삽입 |

---

### 6. 🖨️ PDF 출력 기능

- 인쇄 모드 활성화 → `window.print()` 호출
- 페이지별 분리 출력 (`break-after-page` CSS)
- 블러 영역 PDF에도 적용 (SVG 가우시안 블러 필터)
- 네비게이션/컨트롤 요소 숨김 (`print:hidden` 클래스)

---

## 📊 데이터 구조

### TourData (핵심 데이터 타입)
**파일**: `src/types/tour-data.ts` (~1200줄)

```typescript
interface TourData {
  // 기본 정보
  title: string;
  subtitle: string;
  startDate: string;
  endDate: string;
  totalDays: number;

  // 표지 정보
  coverTitle: string;
  coverMainTitle: string;
  plannerName: string;

  // 여행 정보
  travelParty: string;
  travelTheme: string;
  highlights: string;

  // 항공편 정보
  flights: {
    departure: FlightInfo;
    transit: FlightInfo;
    arrival: FlightInfo;
  };

  // 일정 정보
  itinerary: ItineraryDay[];
  detailedSchedules: DetailedSchedule[];

  // 숙소 정보
  accommodations: Accommodation[];

  // 교통편 정보
  transportationTickets: TransportationTicket[];
  transportationCards: TransportationCard[];

  // 견적 정보
  totalCost: string;
  includedItems: string;
  excludedItems: string;

  // 결제 정보
  paymentMethods: PaymentMethod[];

  // 스타일 정보 (각 요소별 TextStyle)
  coverMainTitleStyle?: TextStyle;
  // ... 100+ 스타일 속성
}
```

---

## 🔧 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

---

## 📝 컴포넌트 목록 (18개)

### 페이지 컴포넌트
| 파일명 | 역할 |
|--------|------|
| `CoverPage.tsx` | 표지 페이지 |
| `IntroductionPage.tsx` | 여행 소개 페이지 |
| `ProcessPage.tsx` | 여행 진행 프로세스 |
| `FlightInfoPage.tsx` | 항공편 정보 (레거시) |
| `FlightDeparturePage.tsx` | 출발 항공편 |
| `FlightTransitPage.tsx` | 경유 항공편 |
| `FlightArrivalPage.tsx` | 도착 항공편 |
| `ItineraryCalendarPage.tsx` | 일정 캘린더 |
| `AccommodationPage.tsx` | 숙소 안내 (기본) |
| `AccommodationPage1.tsx` | 숙소 안내 (변형 1) |
| `AccommodationPage2.tsx` | 숙소 안내 (변형 2) |
| `EditableAccommodationPage.tsx` | 숙소 안내 (편집 가능) |
| `DetailedSchedulePage.tsx` | 세부 일정 |
| `TouristSpotListPage.tsx` | 관광지 리스트 |
| `TransportationTicketPage.tsx` | 교통편 티켓 |
| `TransportationCardPage.tsx` | 교통카드 |
| `QuotationPage.tsx` | 견적서 |
| `PaymentPage.tsx` | 결제 안내 |

### 공통 컴포넌트
| 파일명 | 역할 |
|--------|------|
| `PasswordProtection.tsx` | 비밀번호 보호 화면 |
| `StylePicker.tsx` | 텍스트 스타일 편집기 |
| `ImageWithControls.tsx` | 이미지 컨트롤러 |
| `BlurOverlay.tsx` | 블러 영역 관리 |
| `PageWrapper.tsx` | 페이지 래퍼 |
| `PageEditor.tsx` | 페이지 편집기 |

---

## 🎨 UI 컴포넌트 (Radix UI 기반)

`src/components/ui/` 디렉토리에 40+ 개의 Radix UI 기반 컴포넌트가 포함되어 있습니다:

- accordion, alert-dialog, alert, avatar, badge
- breadcrumb, button, calendar, card, carousel
- chart, checkbox, collapsible, command, context-menu
- dialog, drawer, dropdown-menu, form, hover-card
- input, input-otp, label, menubar, navigation-menu
- pagination, popover, progress, radio-group, resizable
- scroll-area, select, separator, sheet, sidebar
- skeleton, slider, sonner, switch, table
- tabs, textarea, toggle, toggle-group, tooltip

---

## ⚠️ 주의사항

1. **비밀번호 하드코딩**: 프로덕션 환경에서는 보안 강화 필요
2. **localStorage 의존**: 브라우저 데이터 삭제 시 데이터 손실
3. **Figma Make 생성 코드**: 일부 컴포넌트가 최적화되지 않을 수 있음
4. **이미지 URL 의존**: Unsplash 외부 이미지 사용 중

---

## 🔄 향후 개선 방향

- [ ] 백엔드 연동으로 데이터 영구 저장
- [ ] 사용자 인증 시스템 강화
- [ ] PPT 내보내기 기능 완성 (pptxgenjs 사용)
- [ ] 다국어 지원
- [ ] 반응형 모바일 최적화
- [ ] 실시간 협업 기능

---

*마지막 업데이트: 2025-12-08*
