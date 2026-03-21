# Bounded Contexts

## Overview

Phase 1 MVP는 2개의 bounded context로 구성한다.

```
┌─────────────────────────────┐   ┌────────────────┐
│  Tracking (Core Domain)     │   │  Identity       │
│                             │   │  (Supporting)   │
│  Task (Aggregate)           │   │                 │
│  TimeEntry (Aggregate)      │   │  UserProfile    │
│  TimerService               │   │                 │
│  Color, Duration, TimeRange │   │                 │
│  [Statistics: read model]   │   │                 │
└─────────────────────────────┘   └────────────────┘
        │                                 │
        └──── userId (string) ────────────┘

Shared Kernel: core/ (Entity, ValueObject, AggregateRoot, Result, DomainError)
```

---

## 1. Tracking BC (Core Domain)

시간 기록의 핵심 비즈니스 로직을 담당한다.

### Aggregates

| Aggregate | 책임 |
|-----------|------|
| **Task** | Task 생성/수정/아카이브. Color VO 포함 |
| **TimeEntry** | 시간 기록 생명주기. TimeRange, Duration VO 포함 |

### Value Objects

| VO | 소속 | 불변식 |
|----|------|--------|
| **Color** | Task | `#[0-9a-fA-F]{6}` 형식. contrastTextColor 계산 |
| **Duration** | TimeEntry | seconds >= 0. format, add 연산 |
| **TimeRange** | TimeEntry | stoppedAt >= startedAt (둘 다 존재 시) |

### Domain Service

| Service | 책임 |
|---------|------|
| **TimerService** | 단일 활성 타이머 제약 + 자동 전환 로직 |

### Repository Interfaces

- `TaskRepository`
- `TimeEntryRepository`

### Statistics

읽기 전용 집계 모델. 별도 aggregate가 아니며, Application Service 레벨에서 TimeEntry 데이터를 조회·집계한다.

---

## 2. Identity BC (Supporting)

사용자 인증과 프로필 관리를 담당한다.

### Entity

| Entity | 책임 |
|--------|------|
| **UserProfile** | 사용자 설정 (displayName, timezone, Pomodoro 기본값) |

### 인증

Supabase Auth에 위임한다. Domain layer에 Auth 로직은 없으며, infrastructure 레벨에서 처리한다.

### Repository Interface

- `UserProfileRepository`

---

## 3. Shared Kernel

`packages/domain/src/core/`의 base class들은 모든 BC가 공유한다.

- `DomainError`, `Result<T, E>`
- `ValueObject<Props>`, `UniqueEntityID`
- `Entity<Props>`, `AggregateRoot<Props>`
- `IDomainEvent`

---

## BC 간 규칙

- **참조**: BC 간에는 `userId` (string) 로만 참조한다.
- **import 금지**: `tracking/`에서 `identity/`의 클래스를 직접 import하지 않는다. 반대도 마찬가지.
- **통신**: Application Service 레벨에서 필요 시 두 BC의 repository를 조합한다.

---

## 디렉토리 구조

```
packages/domain/src/
├── core/                  # Shared Kernel
├── tracking/              # Tracking BC
│   ├── value-objects/     # Color, Duration, TimeRange
│   ├── entities/          # Task, TimeEntry
│   ├── domain-services/   # TimerService
│   └── repositories/      # interfaces
├── identity/              # Identity BC
│   ├── entities/          # UserProfile
│   └── repositories/      # interfaces
└── index.ts
```

---

## Phase 2 확장

- **Pomodoro BC** 추가: PomodoroSession aggregate. TimeEntry와 느슨한 연결 (pomodoroSessionId nullable FK)
- Reporting BC 분리 여부는 통계 복잡도에 따라 결정
