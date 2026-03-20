# tkbetter Time Tracking App - Implementation Steps

## Phase 0: 프로젝트 셋업 ✅

- [x] 모노레포 설정 (pnpm + Turborepo)
- [x] 앱 스캐폴딩 (`apps/mobile`, `apps/web`, `apps/api`, `packages/shared`)
- [x] PRD 작성 (`docs/0_PRD.md`, `docs/2026-03-20-time-tracking-prd.md`)

## Phase 1: MVP (핵심 가치 검증)

### 1-1. Supabase 설정

- [ ] Supabase 프로젝트 생성
- [ ] DB 스키마 생성 (UserProfile, Task, TimeEntry)
- [ ] RLS 정책 설정 (사용자별 데이터 격리)
- [ ] Partial unique index (단일 활성 타이머 제약)

### 1-2. 도메인 모델 (`@tkbetter/shared`)

- [ ] Entity 정의 (Task, TimeEntry, UserProfile)
- [ ] Value Object 정의 (Color, Duration, TimeRange)
- [ ] Domain Service (TimerService: 자동 전환, 단일 활성 제약)

### 1-3. API (`apps/api`)

- [ ] 인증 (signup, login, logout, me)
- [ ] Task CRUD (생성/수정/아카이브/해제)
- [ ] 시간 기록 (start, stop, 조회, 수동 편집, 삭제, active)
- [ ] 통계 (daily, weekly)

### 1-4. Mobile (`apps/mobile`)

- [ ] 인증 (회원가입/로그인 화면)
- [ ] Task 관리 (목록, 생성/수정, 색상 지정)
- [ ] 시간 기록 (Start/Stop, 자동 전환, 수동 편집)
- [ ] 기본 통계 (오늘 요약, 주별 막대 차트)

### 1-5. 통합 테스트

- [ ] API 통합 테스트 (인증, Task, TimeEntry, 통계)
- [ ] E2E 핵심 플로우 (시간 기록 start → stop → 통계 확인)

## Phase 2: 사용성 확장

- [ ] Pomodoro 타이머 (focus/break 사이클, PomodoroSession 테이블)
- [ ] 웹 대시보드 (`apps/web`: 월별 트렌드, 히트맵, 필터링)
- [ ] 오프라인 지원 (로컬 캐시 + 동기화)
- [ ] OAuth (Google, Apple Sign-In)

## Phase 3: 접근성 강화

- [ ] 모바일 위젯 (홈 화면 Start/Stop, 오늘 기록 시간)
- [ ] Apple Watch (Task 확인, Start/Stop, Complication)

## Phase 4: 수익화 및 고도화

- [ ] 고급 분석 (장기 트렌드, 생산성 점수)
- [ ] 데이터 내보내기 (CSV, JSON)
- [ ] 과금 체계 도입
