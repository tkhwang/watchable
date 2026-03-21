# tkbetter Time Tracking App - Implementation Steps

## Phase 0: 프로젝트 셋업 ✅

- [x] 모노레포 설정 (pnpm + Turborepo)
- [x] 앱 스캐폴딩 (`apps/mobile`, `apps/web`, `apps/api`, `packages/shared`)
- [x] PRD 작성 (`docs/0_PRD.md`, `docs/2026-03-20-time-tracking-prd.md`)

## Phase 1: MVP (핵심 가치 검증)

> 기능 단위 vertical slice: 각 슬라이스가 끝나면 동작하는 기능이 하나 완성됨.

### D0: Shared Domain Model 구현

> S1~S4에서 공통으로 사용할 DDD 도메인 모델을 `@tkbetter/domain`에 선행 구현한다.
> 상세: [`docs/ddd/D0_DDD.md`](ddd/D0_DDD.md)

- [ ] Base Classes: `DomainError`, `DomainEvent`, `ValueObject<T>`, `Entity<T>`, `AggregateRoot<T>`
- [ ] Value Objects: `Duration`, `Color`, `TimeRange`
- [ ] Entities: `Task`, `TimeEntry`, `UserProfile`
- [ ] Domain Service: `TimerService`
- [ ] Repository Interfaces: `TaskRepository`, `TimeEntryRepository`
- [ ] Barrel Export & type-check 통과

### S0: 프로젝트 기반 (Supabase + API 클라이언트)

- [ ] Supabase 프로젝트 생성 및 환경변수 설정 (`.env`)
- [ ] `apps/api`: Supabase 클라이언트 연결
- [ ] `apps/mobile`: API 클라이언트 설정 (axios/fetch wrapper)
- [ ] 앱 ↔ 서버 통신 확인 (health check)

### S1: 회원가입/로그인

- [ ] DB: `user_profiles` 테이블 + RLS
- [ ] Shared: `UserProfile` Entity
- [ ] API: `POST /auth/signup`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`
- [ ] Mobile: 회원가입 화면, 로그인 화면, 인증 상태 관리
- [ ] 검증: 가입 → 로그인 → 프로필 조회 동작 확인

### S2: Task 생성/목록

- [ ] DB: `tasks` 테이블 + RLS
- [ ] Shared: `Task` Entity, `Color` VO
- [ ] API: `POST /tasks`, `GET /tasks`
- [ ] Mobile: Task 목록 화면, Task 생성 화면 (이름 + 색상)
- [ ] 검증: Task 생성 → 목록에 표시 확인

### S3: Task 수정/아카이브

- [ ] API: `PATCH /tasks/:id`, `PATCH /tasks/:id/archive`, `PATCH /tasks/:id/unarchive`
- [ ] Mobile: Task 편집 화면, 아카이브/해제 UI
- [ ] 검증: Task 이름/색상 변경, 아카이브 후 목록에서 숨김 확인

### S4: 타이머 시작/정지 (핵심)

- [ ] DB: `time_entries` 테이블 + RLS + partial unique index (단일 활성 제약)
- [ ] Shared: `TimeEntry` Entity, `Duration` VO, `TimeRange` VO, `TimerService`
- [ ] API: `POST /time-entries/start`, `POST /time-entries/stop`, `GET /time-entries/active`
- [ ] Mobile: 타이머 UI (Task 선택 → Start → 경과 시간 표시 → Stop)
- [ ] 검증: 타이머 시작 → 경과 시간 실시간 표시 → 정지 → 기록 저장 확인

### S5: 자동 전환 + 기록 조회

- [ ] API: start 시 기존 활성 타이머 자동 종료, `GET /time-entries?date=`
- [ ] Mobile: 다른 Task 탭으로 자동 전환, 오늘의 기록 목록 표시
- [ ] 검증: Task A 진행 중 → Task B 탭 → A 자동 종료 + B 시작 확인

### S6: 기록 편집/삭제

- [ ] API: `PATCH /time-entries/:id` (startedAt/stoppedAt 수정, duration 재계산), `DELETE /time-entries/:id`
- [ ] Mobile: 기록 편집 화면 (시작/종료 시간 수정), 삭제 확인 다이얼로그
- [ ] 검증: 시작/종료 시간 수정 → duration 재계산, 삭제 → 목록에서 제거 확인

### S7: 기본 통계

- [ ] API: `GET /stats/daily?date=`, `GET /stats/weekly?date=`
- [ ] Mobile: 오늘의 Task별 시간 요약, 주별 막대 차트
- [ ] 검증: 기록 데이터 기반 통계 정확성 확인 → **MVP 완성**

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
