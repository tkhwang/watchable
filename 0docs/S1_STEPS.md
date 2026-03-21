# tkbetter Time Tracking App - Implementation Steps

## 개발 워크플로우

각 빌딩 블록은 **Spec → Test → Impl** 순서로 개발한다.

- **Spec**: `0docs/ddd/design/` 에 설계 문서 작성 (invariants, 핵심 행동, edge cases)
- **Test (Red)**: spec 기반 테스트 작성 → 모든 테스트 실패 확인
- **Impl (Green → Refactor)**: 최소 구현 → 통과 → 리팩터링

---

## Phase 0: 프로젝트 셋업 ✅

- [x] 모노레포 설정 (pnpm + Turborepo)
- [x] 앱 스캐폴딩 (`apps/mobile`, `apps/web`, `apps/api`, `packages/shared`)
- [x] PRD 작성 (`docs/0_PRD.md`, `docs/2026-03-20-time-tracking-prd.md`)

## Phase 1: MVP (핵심 가치 검증)

> 기능 단위 vertical slice: 각 슬라이스가 끝나면 동작하는 기능이 하나 완성됨.

### D0: Shared Domain Model 구현

> **패키지**: `@life-logs/domain` (`packages/domain/src/`)
> **워크플로우**: Spec → Test → Impl (TDD)
> **의존성**: `Base Classes → Value Object → Entity → Domain Service`
> **설계 원본**: [`specs/2026-03-20-fullstack-ddd-design.md`](specs/2026-03-20-fullstack-ddd-design.md)

#### Base Classes

> `packages/domain/src/core/` — 모든 VO·Entity·Aggregate가 상속하는 추상 기반

| #   | Name                 | 파일                       | 역할                                                  |
| --- | -------------------- | -------------------------- | ----------------------------------------------------- |
| 0-1 | `DomainError`        | `core/domain-error.ts`     | 도메인 전용 에러 (abstract, code + message)           |
| 0-2 | `Result`             | `core/result.ts`           | Result 패턴 (ok/fail)                                 |
| 0-3 | `ValueObject<Props>` | `core/value-object.ts`     | 불변 값 타입 추상 기반 (equals, props freeze)         |
| 0-4 | `UniqueEntityID`     | `core/unique-entity-id.ts` | Entity ID VO (ValueObject 상속, 빈 문자열 검증)       |
| 0-5 | `Entity<Props>`      | `core/entity.ts`           | ID 기반 엔티티 추상 기반 (UniqueEntityID, props 가변) |
| 0-6 | `IDomainEvent`       | `core/domain-event.ts`     | 도메인 이벤트 인터페이스 (eventName, occurredOn, aggregateId) |
| 0-7 | `AggregateRoot<Props>` | `core/aggregate-root.ts` | Entity 확장, 도메인 이벤트 수집 (#domainEvents, pullDomainEvents) |
| 0-8 | Barrel               | `core/index.ts`            | core 모듈 re-export                                   |

- [x] `DomainError` — abstract class, code + message, 서브클래스 강제
- [x] `Result` — `ok()` / `fail()` 헬퍼, factory method에서 사용
- [x] `ValueObject<Props>` — props freeze, equals 기본 구현
- [x] `UniqueEntityID` — ValueObject 상속, `create(value)` → Result, 빈 문자열 검증
- [x] `Entity<Props>` — UniqueEntityID + props 가변, constructor 체크 + ID equals
- [x] `IDomainEvent` — interface (eventName, occurredOn, aggregateId)
- [x] `AggregateRoot<Props>` — Entity 확장, #domainEvents, addDomainEvent, pullDomainEvents
- [x] `core/index.ts` — barrel export 구성 완료

#### Value Objects

| #   | Name        | 파일                          | 핵심 행동                                             | 설계 문서                                |
| --- | ----------- | ----------------------------- | ----------------------------------------------------- | ---------------------------------------- |
| 1   | `Duration`  | `value-objects/duration.ts`   | `fromSeconds()`, `fromMinutes()`, `format()`, `add()` | `ddd/design/value-objects/duration.md`   |
| 2   | `Color`     | `value-objects/color.ts`      | `fromHex()`, `rgb`, `contrastTextColor()`             | `ddd/design/value-objects/color.md`      |
| 3   | `TimeRange` | `value-objects/time-range.ts` | `running()`, `stop()`, `duration()`, `isRunning`      | `ddd/design/value-objects/time-range.md` |

- [ ] `Duration` — 시간 길이 (seconds 기반, format/add/비교)
- [ ] `Color` — hex 색상 (검증, RGB 변환, contrast 텍스트 색상)
- [ ] `TimeRange` — 시작/종료 시간 범위 (running 상태, duration 계산, stop)

#### Entities

| #   | Name          | 파일                       | 핵심 행동                                                               | 설계 문서                             |
| --- | ------------- | -------------------------- | ----------------------------------------------------------------------- | ------------------------------------- |
| 4   | `Task`        | `entities/task.ts`         | `create()`, `rename()`, `changeColor()`, `archive()`, `canStartTimer()` | `ddd/design/entities/task.md`         |
| 5   | `TimeEntry`   | `entities/time-entry.ts`   | `start()`, `stop()`, `duration()`, `editTimes()`                        | `ddd/design/entities/time-entry.md`   |
| 6   | `UserProfile` | `entities/user-profile.ts` | `create()`, Pomodoro 기본값 관리                                        | `ddd/design/entities/user-profile.md` |

- [ ] `Task` — Task 생성/수정/아카이브 (Color VO 포함)
- [ ] `TimeEntry` — 시간 기록 (TimeRange/Duration VO 포함, start/stop/editTimes)
- [ ] `UserProfile` — 사용자 프로필 (Pomodoro 기본값 포함)

#### Domain Service

- [ ] `TimerService` — 자동 전환 로직 (단일 활성 타이머 제약, archived task 방지)

#### Repository Interfaces

- [ ] `TaskRepository` — Task 영속화 인터페이스
- [ ] `TimeEntryRepository` — TimeEntry 영속화 인터페이스

#### Barrel Export & 검증

- [ ] `domain/index.ts` barrel export 구성
- [ ] `pnpm --filter @life-logs/domain type-check` 통과 확인

#### 공통 패턴

- **Class 기반 Rich Domain Model**: 도메인 로직을 메서드로 캡슐화
- **Private constructor + Static factory**: `create()` → `Result<T, DomainError>` 반환
- **Self-hydrating serialization**: `fromJSON()` / `toJSON()` 내장
- **외부 의존성 없음**: 순수 TypeScript만 사용

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
