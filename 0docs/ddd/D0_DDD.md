# DDD Domain Model — Building Blocks

> **패키지**: `@tkbetter/domain` (`packages/domain/src/domain/`)
> **설계 원본**: [`docs/2026-03-20-fullstack-ddd-design.md`](../2026-03-20-fullstack-ddd-design.md)
> **방식**: 각 빌딩 블록별 설계 문서 작성 → TDD 구현

---

## 개발 워크플로우

각 빌딩 블록은 **Spec → Test → Impl** 순서로 개발한다.

### Phase 1: Spec (설계 문서)

- `docs/ddd/` 에 설계 문서 작성 (아래 표의 "설계 문서" 컬럼)
- 정의할 것: invariants, 핵심 행동, edge cases, 입출력 타입
- 설계 문서가 곧 테스트 케이스의 원천

### Phase 2: Test (Red)

- spec 기반으로 테스트 케이스 작성
- 구현 없이 테스트만 먼저 — 모든 테스트가 **실패(Red)** 하는 상태 확인
- 테스트가 spec의 invariants와 edge cases를 빠짐없이 커버하는지 점검

### Phase 3: Impl (Green → Refactor)

- 테스트를 통과시키는 최소 구현 작성 (Green)
- 통과 후 중복 제거·가독성 개선 (Refactor)
- 리팩터링 후에도 테스트가 여전히 통과하는지 확인

### 의존성 순서

의존하는 것이 없는 블록부터 구현한다:

```
Value Object → Entity → Domain Service
```

- **Value Object**: 외부 의존 없음 — 가장 먼저 구현
- **Entity**: Value Object에 의존 — VO 완성 후 구현
- **Domain Service**: Entity·VO에 의존 — 마지막에 구현

---

## 진행 현황

> S1~S4에서 공통으로 사용할 DDD 도메인 모델을 `@tkbetter/domain`에 선행 구현한다.

### Value Objects

- [ ] `Duration` — 시간 길이 (seconds 기반, format/add/비교)
- [ ] `Color` — hex 색상 (검증, RGB 변환, contrast 텍스트 색상)
- [ ] `TimeRange` — 시작/종료 시간 범위 (running 상태, duration 계산, stop)

### Entities

- [ ] `Task` — Task 생성/수정/아카이브 (Color VO 포함)
- [ ] `TimeEntry` — 시간 기록 (TimeRange/Duration VO 포함, start/stop/editTimes)
- [ ] `UserProfile` — 사용자 프로필 (Pomodoro 기본값 포함)

### Domain Service

- [ ] `TimerService` — 자동 전환 로직 (단일 활성 타이머 제약, archived task 방지)

### Repository Interfaces

- [ ] `TaskRepository` — Task 영속화 인터페이스
- [ ] `TimeEntryRepository` — TimeEntry 영속화 인터페이스

### Barrel Export & 검증

- [ ] `domain/index.ts` barrel export 구성
- [ ] `pnpm --filter @tkbetter/domain type-check` 통과 확인

---

## 빌딩 블록 상세

### Value Objects (불변 값 타입, 행동 포함)

| #   | Name        | 파일                          | 핵심 행동                                             | 설계 문서           |
| --- | ----------- | ----------------------------- | ----------------------------------------------------- | ------------------- |
| 1   | `Duration`  | `value-objects/duration.ts`   | `fromSeconds()`, `fromMinutes()`, `format()`, `add()` | `D1_VO_Duration.md`  |
| 2   | `Color`     | `value-objects/color.ts`      | `fromHex()`, `rgb`, `contrastTextColor()`             | `D2_VO_Color.md`     |
| 3   | `TimeRange` | `value-objects/time-range.ts` | `running()`, `stop()`, `duration()`, `isRunning`      | `D3_VO_TimeRange.md` |

### Entities (고유 ID, 도메인 로직 캡슐화)

| #   | Name          | 파일                       | 핵심 행동                                                               | 설계 문서                 |
| --- | ------------- | -------------------------- | ----------------------------------------------------------------------- | ------------------------- |
| 4   | `Task`        | `entities/task.ts`         | `create()`, `rename()`, `changeColor()`, `archive()`, `canStartTimer()` | `D4_Entity_Task.md`        |
| 5   | `TimeEntry`   | `entities/time-entry.ts`   | `start()`, `stop()`, `duration()`, `editTimes()`                        | `D5_Entity_TimeEntry.md`   |
| 6   | `UserProfile` | `entities/user-profile.ts` | `create()`, Pomodoro 기본값 관리                                        | `D6_Entity_UserProfile.md` |

### Domain Services (Entity에 속하지 않는 도메인 로직)

| #   | Name           | 파일                        | 핵심 행동                                         | 설계 문서                   |
| --- | -------------- | --------------------------- | ------------------------------------------------- | --------------------------- |
| 7   | `TimerService` | `services/timer-service.ts` | `startTimer()` — 단일 활성 타이머 제약, 자동 전환 | `D7_Service_TimerService.md` |

### Repository Interfaces (영속화 인터페이스)

| #   | Name                  | 파일                                    | 설계 문서                    |
| --- | --------------------- | --------------------------------------- | ---------------------------- |
| 8   | `TaskRepository`      | `repositories/task-repository.ts`       | `D8_Repository_Interfaces.md` |
| 8   | `TimeEntryRepository` | `repositories/time-entry-repository.ts` | `D8_Repository_Interfaces.md` |

### Barrel Exports

| #   | Name  | 파일       | 설계 문서             |
| --- | ----- | ---------- | --------------------- |
| 9   | Index | `index.ts` | `D9_Barrel_Exports.md` |

---

## 공통 패턴

- **Class 기반 Rich Domain Model**: 도메인 로직을 메서드로 캡슐화
- **Private constructor + Static factory**: `create()`, `fromSeconds()` 등
- **Self-hydrating serialization**: `fromJSON()` / `toJSON()` 내장
- **외부 의존성 없음**: 순수 TypeScript만 사용
