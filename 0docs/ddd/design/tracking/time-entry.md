# TimeEntry

> **파일**: `packages/domain/src/tracking/entities/time-entry.ts`
> **BC**: Tracking
> **상속**: `AggregateRoot<TimeEntryProps>`
> **역할**: 시간 기록의 생명주기 관리. 시작/종료/수동 편집

---

## Props

```typescript
{
  taskId: UniqueEntityID;
  timeRange: TimeRange;
  userId: UniqueEntityID;
}
```

## 불변식

- `taskId`, `userId`: 유효한 UniqueEntityID
- `timeRange`: 유효한 TimeRange VO (stoppedAt >= startedAt)
- 동시 활성 타이머 제약은 **TimerService** 책임 (TimeEntry 자체는 모름)

## Error

```typescript
export class InvalidTimeEntryError extends DomainError {
  constructor(message: string) {
    super('INVALID_TIME_ENTRY', message);
  }
}
```

---

## API (method 순서: factory → command → query → getter)

### Factory

| 메서드  | 시그니처                                                                                                               | 설명                                              |
| ------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `start` | `(props: { id: string, taskId: string, userId: string, startedAt: Date }): Result<TimeEntry, InvalidTimeEntryError>` | running 상태로 생성. TimeEntryStarted 이벤트 발행 |

### Command (void, throw on failure)

| 메서드      | 시그니처                                     | 설명                                                                        |
| ----------- | -------------------------------------------- | --------------------------------------------------------------------------- |
| `stop`      | `(at: Date): void`                           | running → stopped. 이미 stopped이면 throw. at < startedAt이면 throw         |
| `editTimes` | `(startedAt: Date, stoppedAt: Date): void`   | stopped에서만. running이면 throw. stoppedAt < startedAt이면 throw           |

### Query

| 메서드      | 시그니처                  | 설명                              |
| ----------- | ------------------------- | --------------------------------- |
| `duration`  | `(now?: Date): Duration`  | timeRange.duration() 위임         |
| `isRunning` | `(): boolean`             | timeRange.isRunning 위임          |

### Getter

| 메서드      | 시그니처                           | 설명                       |
| ----------- | ---------------------------------- | -------------------------- |
| `taskId`    | `get taskId(): UniqueEntityID`     |                            |
| `timeRange` | `get timeRange(): TimeRange`       |                            |
| `userId`    | `get userId(): UniqueEntityID`     |                            |
| `startedAt` | `get startedAt(): Date`            | timeRange.startedAt 위임   |
| `stoppedAt` | `get stoppedAt(): Date \| null`    | timeRange.stoppedAt 위임   |

---

## Domain Events

| 이벤트                              | 발행 시점     |
| ----------------------------------- | ------------- |
| `tracking.time-entry.started`       | `start()`     |
| `tracking.time-entry.stopped`       | `stop()`      |
| `tracking.time-entry.times-edited`  | `editTimes()` |

---

## 설계 포인트

- **TimeRange VO에 위임**: stop/editTimes의 시간 검증은 TimeRange가 담당. TimeEntry는 상태 가드(running/stopped)만 책임
- **editTimes는 stopped에서만**: PRD "기록 후 시작/종료 시간 수동 편집" — running 중 편집은 Phase 1 범위 밖
- **단일 활성 제약**: TimerService에서 처리 (TimeEntry는 모름)

## Equals

기본 구현 사용 (Entity.equals — ID 비교). override 불필요.

## 의존성

- `TimeRange` VO (`timeRange` prop)
- `Duration` VO (`duration()` 반환 타입)
- `AggregateRoot` base class
- `UniqueEntityID`

## 직렬화

없음. Repository 도입 시 `fromJSON()`/`toJSON()` 추가 예정 (Domain First, Persistence Later).
