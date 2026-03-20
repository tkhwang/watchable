# tkbetter Time Tracking App - PRD

## 1. Problem & Vision

### Problem

시간을 어디에 쓰고 있는지 직관적으로 파악하기 어렵다.

- **시간 사용 파악 어려움**: 하루가 끝나면 "오늘 뭐 했지?" 싶을 때가 많다. 체감과 실제 시간 사용 사이에 괴리가 크다.
- **기존 앱의 높은 마찰**: 기록을 시작하려면 앱을 열고, 카테고리를 고르고, 설명을 쓰고… 단계가 많아 습관이 안 된다.
- **인사이트 부족**: 기록만 쌓이고 "그래서 어떻게 바꿔야 하는데?"에 대한 답이 없다.

### Vision

> "한 번의 터치로 시간을 기록하고, 데이터로 시간 사용 패턴을 이해하는 앱"

최소 마찰로 기록하고, 축적된 데이터에서 패턴과 인사이트를 제공한다.

### Target Users

생산성 추적이 필요한 개인:

- **프리랜서**: 프로젝트별 시간 투입을 파악해 청구 및 효율 관리
- **학생**: 공부 시간 추적과 집중도 분석
- **지식 노동자**: 회의, 딥워크, 잡무 비율을 시각화하여 시간 배분 개선

---

## 2. Core Features

### F1: Task 관리

사용자가 시간을 기록할 대상(Task)을 관리한다.

| 기능 | 설명 |
|------|------|
| 생성/수정 | Task 생성 및 수정 |
| 색상/아이콘 | Task별 시각 구분을 위한 색상 및 아이콘 지정 |
| 정렬 | 사용자 정의 순서 (drag & drop) |
| 아카이브 | 더 이상 사용하지 않는 Task를 숨김 처리. 아카이브 해제로 복원 가능 |

### F2: 시간 기록

Task에 대한 시간을 start/stop 방식으로 기록한다.

| 기능 | 설명 |
|------|------|
| Start/Stop 타이머 | 한 번 탭으로 기록 시작, 다시 탭으로 종료 |
| 자동 전환 | 다른 Task를 시작하면 현재 Task 자동 종료 후 새 Task 시작 |
| 단일 활성 제약 | 동시에 하나의 Task만 기록 가능 (데이터 무결성) |
| 수동 편집 | 기록 후 시작/종료 시간 수정 가능 |

### F3: Pomodoro 타이머

집중-휴식 사이클을 지원하는 Pomodoro 모드.

| 기능 | 설명 |
|------|------|
| 모드 선택 | 일반 타이머 / Pomodoro 모드 중 선택 |
| 기본 사이클 | 25분 집중 + 5분 휴식 |
| 긴 휴식 | 4회 완료 시 15분 긴 휴식 |
| 알림 | 각 단계 전환 시 알림 |
| 기록 연동 | Pomodoro 세션도 시간 기록에 자동 반영 |

**Pomodoro-TimeEntry 매핑 규칙:**

- **focus 세션**: 1개의 PomodoroSession = 1개의 TimeEntry. TimeEntry.pomodoroSessionId로 연결.
- **break 세션**: TimeEntry를 생성하지 않음 (휴식은 시간 기록 대상이 아님).
- **조기 종료**: 사용자가 focus 도중 정지하면 PomodoroSession.completedAt = null, actualDuration = 실제 경과 시간. 연결된 TimeEntry도 해당 시점에 stoppedAt 설정.
- **건너뛰기**: 사용자가 break를 건너뛰면 다음 focus로 즉시 진행.
- **break의 taskId**: break 세션은 직전 focus 세션의 taskId를 상속한다 (Pomodoro 사이클 추적용).

### F4: 통계 및 대시보드

기록된 데이터를 시각화하여 패턴을 파악한다.

| 플랫폼 | 기능 |
|--------|------|
| **모바일** | 일별/주별 차트, Task별 비율, 오늘의 요약 |
| **웹** | 상세 대시보드: 월별 트렌드, Task 간 비교, 히트맵, 필터링 |

### F5: 모바일 위젯 (Phase 3)

홈 화면에서 바로 기록을 시작/확인할 수 있는 위젯.

- 현재 진행 중인 Task 표시
- 위젯에서 바로 Start/Stop
- 오늘의 총 기록 시간 표시

### F6: Apple Watch (Phase 3)

손목에서 빠르게 기록을 제어한다.

- 현재 Task 확인
- Start/Stop 제어
- Complication으로 오늘의 기록 시간 표시

### F7: 인증

Supabase Auth 기반 인증.

| 방식 | 설명 |
|------|------|
| Email/Password | 기본 회원가입 및 로그인 |
| Google OAuth | 소셜 로그인 |
| Apple Sign-In | iOS 필수 요구사항 충족 |

---

## 3. Tech Stack & Architecture

### Tech Stack

| 영역 | 기술 | 비고 |
|------|------|------|
| Mobile | React Native + Expo SDK 52 | `apps/mobile` |
| Web | Next.js 16 + React 19 | `apps/web` |
| Backend | NestJS 11 | `apps/api` |
| DB | Supabase (PostgreSQL) | Managed, RLS 활용 |
| Auth | Supabase Auth | Email + Google + Apple |
| Shared | `@tkbetter/shared` | 도메인 모델, 타입, 유틸 |
| Monorepo | pnpm + Turborepo | 기존 설정 활용 |

### Architecture: Tactical DDD

도메인 중심 설계를 적용하여 비즈니스 로직을 명확히 분리한다.

#### DDD 구성 요소

| 개념 | 역할 | 예시 |
|------|------|------|
| **Entity** | 고유 ID를 가진 도메인 객체 | Task, TimeEntry, User |
| **Value Object** | 불변 값 타입 | Color, Duration, TimeRange |
| **Aggregate** | 일관성 경계 단위 | Task (독립), TimeEntry (독립), PomodoroSession (독립) |
| **Repository** | 영속화 인터페이스 | TaskRepository, TimeEntryRepository, PomodoroSessionRepository |
| **Domain Service** | Entity에 속하지 않는 도메인 로직 | TimerService (자동 전환, 단일 활성 제약 로직) |

#### Layered Architecture

```
Presentation (UI / API Controller)
    ↓
Application (Use Case / Service)
    ↓
Domain (Entity, VO, Aggregate, Domain Service)
    ↓
Infrastructure (Repository 구현, Supabase Client)
```

- **Domain 계층**은 외부 의존성이 없다 (순수 TypeScript).
- **Infrastructure**가 Domain의 Repository 인터페이스를 구현한다.
- `@tkbetter/shared`에 Domain 계층을 위치시켜 모든 앱에서 공유한다.
- **Value Object**는 도메인 계층에서 타입으로 강제하고, DB에는 primitive로 저장한다.

#### Aggregate 설계 원칙

Task, TimeEntry, PomodoroSession은 각각 **독립된 Aggregate**로 설계한다.

- **Task Aggregate**: Task 자체의 CRUD와 속성 관리만 담당.
- **TimeEntry Aggregate**: 개별 시간 기록의 생명주기 관리. taskId로 Task를 참조하되 Task aggregate에 포함되지 않음.
- **PomodoroSession Aggregate**: Pomodoro 세션의 생명주기 관리.
- **단일 활성 타이머 제약**은 `TimerService` (Domain Service)에서 enforce. DB 레벨에서는 partial unique index (`CREATE UNIQUE INDEX ON time_entries(user_id) WHERE stopped_at IS NULL`)로 보장.

### 도메인 모델 (Data Model 초안)

#### UserProfile

```typescript
interface UserProfile {
  id: string;           // UUID (= Supabase Auth uid)
  displayName: string;
  timezone: string;     // IANA timezone (e.g. "Asia/Seoul")
  pomodoroFocusMin: number;   // default: 25
  pomodoroShortBreakMin: number; // default: 5
  pomodoroLongBreakMin: number;  // default: 15
  createdAt: Date;
  updatedAt: Date;
}
```

#### Task

```typescript
interface Task {
  id: string;           // UUID
  userId: string;
  name: string;
  color: string;        // hex color
  icon: string;         // icon identifier
  sortOrder: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### TimeEntry

```typescript
interface TimeEntry {
  id: string;           // UUID
  userId: string;
  taskId: string;
  startedAt: Date;      // UTC
  stoppedAt: Date | null; // null = 진행 중
  duration: number | null; // seconds, stoppedAt 설정 시 계산. startedAt/stoppedAt 수정 시에도 재계산 필수. 진행 중(null)이면 클라이언트에서 startedAt 기준 실시간 표시
  pomodoroSessionId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### PomodoroSession

```typescript
interface PomodoroSession {
  id: string;           // UUID
  userId: string;
  taskId: string;
  type: 'focus' | 'short_break' | 'long_break';
  plannedDuration: number; // seconds
  actualDuration: number | null;
  startedAt: Date;       // 세션 실제 시작 시점 (createdAt과 분리)
  completedAt: Date | null;
  createdAt: Date;
}
```

#### Phase 1 스키마 전략

Pomodoro는 Phase 2 기능이지만, 스키마 호환성을 위해 다음과 같이 처리한다:

- **Phase 1에 포함**: TimeEntry의 `pomodoroSessionId` 컬럼 (nullable), UserProfile의 Pomodoro 설정 필드 (기본값 적용)
- **Phase 2에서 생성**: `pomodoro_sessions` 테이블. Phase 1에서는 테이블 없이 nullable FK만 유지

---

## 4. User Flows & Non-Functional Requirements

### 핵심 User Flows

#### Flow 1: 온보딩

```
앱 실행 → 회원가입/로그인 → 첫 Task 생성 가이드 → 메인 화면
```

#### Flow 2: 시간 기록 (핵심 플로우)

```
메인 화면 → Task 선택 → 타이머 시작 (한 번 탭)
→ 다른 Task 탭 시 자동 전환
→ 정지 버튼으로 종료
→ 기록 저장
```

#### Flow 3: Pomodoro 모드

```
Task 선택 → Pomodoro 모드 활성화 → 25분 집중 시작
→ 알림: 집중 끝 → 5분 휴식 시작
→ 4사이클 후 15분 긴 휴식
→ 전체 기록 시간에 자동 반영
```

#### Flow 4: 통계 확인

```
통계 탭 → 일별 요약 (오늘의 Task별 시간)
→ 주별 차트 → 웹에서 상세 대시보드 접근
```

### Non-Functional Requirements (NFR)

| 항목 | 요구사항 |
|------|---------|
| **반응 속도** | 타이머 시작/정지 200ms 이내 응답 |
| **오프라인** | Phase 2에서 구현. Phase 1은 온라인 필수. Phase 2에서 로컬 캐시 + last-write-wins 동기화 도입 예정 |
| **보안** | Supabase RLS로 사용자별 데이터 격리 |
| **시간대** | 모든 시간 UTC 저장, 클라이언트에서 로컬 변환 |
| **데이터 정합성** | 동시에 하나의 활성 타이머만 허용 |
| **접근성** | VoiceOver/TalkBack 기본 지원 |

### Phase 구분

| Phase | 범위 | 목표 |
|-------|------|------|
| **Phase 1 (MVP)** | 인증 + Task 관리 + 시간 기록 + 기본 통계 | 핵심 가치 검증 |
| **Phase 2** | Pomodoro 타이머 + 웹 대시보드 + 오프라인 지원 | 사용성 확장 |
| **Phase 3** | 모바일 위젯 + Apple Watch | 접근성 강화 |
| **Phase 4** | 고급 분석, 데이터 내보내기, 과금 | 수익화 및 고도화 |

#### Phase별 앱 범위

| Phase | Mobile | Web | API |
|-------|--------|-----|-----|
| **Phase 1** | O (주력) | X (미구현) | O |
| **Phase 2** | O | O (대시보드) | O |
| **Phase 3** | O (위젯) | O | O |
| **Phase 4** | O | O | O |

### Phase 1 MVP 상세 범위

- **인증**: Email/Password 가입 및 로그인만. Google/Apple OAuth는 Phase 2에서 추가 (Apple Sign-In은 App Store 제출 전 필수)
- **Task 관리**: CRUD + 색상 지정 (아이콘, 정렬은 Phase 2)
- **시간 기록**: Start/Stop + 자동 전환 + 단일 활성 제약
- **기본 통계**: 오늘의 기록 요약 (Task별 시간), 주별 막대 차트

---

## 5. API Endpoints (Phase 1)

인증은 Supabase Auth 클라이언트를 통해 처리하며, 아래는 NestJS API 서버의 엔드포인트.

### Auth

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/auth/signup` | Email/Password 회원가입 |
| POST | `/auth/login` | 로그인 (JWT 반환) |
| POST | `/auth/logout` | 로그아웃 |
| GET | `/auth/me` | 현재 사용자 프로필 조회 |

### Tasks

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/tasks` | 사용자의 Task 목록 조회. `?includeArchived=true`로 아카이브 포함 가능 |
| POST | `/tasks` | Task 생성 |
| PATCH | `/tasks/:id` | Task 수정 |
| PATCH | `/tasks/:id/archive` | Task 아카이브 (isArchived = true). 기존 TimeEntry는 유지 |
| PATCH | `/tasks/:id/unarchive` | Task 아카이브 해제 (isArchived = false) |

### Time Entries

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/time-entries/start` | 타이머 시작 (기존 활성 타이머 자동 종료) |
| POST | `/time-entries/stop` | 현재 활성 타이머 종료 |
| GET | `/time-entries?date=YYYY-MM-DD` | 특정 날짜 기록 조회. date는 사용자 timezone 기준 |
| GET | `/time-entries?from=&to=` | 기간별 기록 조회. ISO 8601 datetime (UTC) |
| PATCH | `/time-entries/:id` | 기록 수동 편집 (startedAt, stoppedAt). duration 자동 재계산 |
| DELETE | `/time-entries/:id` | 기록 삭제 (hard delete. 잘못된 기록 제거용) |
| GET | `/time-entries/active` | 현재 활성 타이머 조회 |

### Statistics

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/stats/daily?date=YYYY-MM-DD` | 일별 Task별 시간 요약. date는 사용자 timezone 기준 |
| GET | `/stats/weekly?date=YYYY-MM-DD` | 주별 통계 (해당 주, ISO week 월요일 시작). date는 사용자 timezone 기준 |

> **날짜 경계 처리**: `date` 파라미터는 사용자의 `UserProfile.timezone` 기준으로 해석한다. 서버는 해당 timezone의 자정~자정을 UTC 범위로 변환하여 쿼리한다. 주간 통계는 ISO week 기준 (월요일 시작).

---

## 6. Edge Cases & Error Handling

| 시나리오 | 처리 방식 |
|---------|----------|
| Task 아카이브 시 기존 TimeEntry | 아카이브된 Task의 기존 TimeEntry는 유지되며 통계에 포함. 아카이브된 Task로는 새 기록 불가 |
| 장시간 방치 타이머 (24h+) | 클라이언트에서 경고 표시. 사용자가 수동으로 종료 시간 편집 가능 |
| 동시 디바이스 타이머 충돌 | 서버의 partial unique index가 방지. 두 번째 요청은 409 Conflict 반환 |
| Task 없는 상태 (empty state) | 온보딩 가이드 표시: "첫 번째 Task를 만들어보세요" |
| 네트워크 오류 시 Start/Stop | Phase 1: 에러 토스트 표시 + 재시도 버튼. Phase 2: 오프라인 큐잉 |

---

## Appendix

### 기존 모노레포 구조

현재 `@tkbetter` 모노레포가 구성되어 있으며, 아래 앱/패키지가 존재한다:

```
apps/mobile    # React Native Expo
apps/web       # Next.js
apps/api       # NestJS
packages/shared # @tkbetter/shared
```

자세한 내용은 `docs/superpowers/specs/2026-03-11-monorepo-setup-design.md` 참조.

### 관련 문서

- Monorepo Setup Design: `docs/superpowers/specs/2026-03-11-monorepo-setup-design.md`
