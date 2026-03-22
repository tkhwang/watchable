# TimeRange

> **파일**: `packages/domain/src/tracking/value-objects/time-range.ts`
> **BC**: Tracking
> **역할**: 시간 기록의 시작/종료 구간을 표현하는 Value Object

---

## Props

```typescript
{
  startedAt: Date;
  stoppedAt: Date | null;
}
```

## 불변식

- `stoppedAt !== null`이면 `stoppedAt >= startedAt`
- `stoppedAt === null`이면 running 상태

## Error

```typescript
export class InvalidTimeRangeError extends DomainError {
  constructor(message: string) {
    super('INVALID_TIME_RANGE', message);
  }
}
```

---

## API (method 순서: factory → command → query → getter)

### Factory

| 메서드    | 시그니처                                                                               | 설명                                      |
| --------- | -------------------------------------------------------------------------------------- | ----------------------------------------- |
| `from`    | `(startedAt: Date, stoppedAt: Date \| null): Result<TimeRange, InvalidTimeRangeError>` | 기존 기록으로부터 생성. stoppedAt < startedAt이면 실패 |
| `start`   | `(at: Date): TimeRange`                                                                | stoppedAt = null. 항상 성공 (Result 없음). stop(at)과 대칭 |

### Command

| 메서드 | 시그니처                                               | 설명                                                              |
| ------ | ------------------------------------------------------ | ----------------------------------------------------------------- |
| `stop` | `(at: Date): Result<TimeRange, InvalidTimeRangeError>` | 새 인스턴스 반환. at < startedAt이면 실패. 이미 stopped이면 실패. |

### Query

| 메서드     | 시그니처                 | 설명                                                                              |
| ---------- | ------------------------ | --------------------------------------------------------------------------------- |
| `duration` | `(now?: Date): Duration` | stopped → stoppedAt - startedAt. running → now - startedAt. now 기본값 new Date() |

### Getter

| 메서드      | 시그니처                        | 설명                        |
| ----------- | ------------------------------- | --------------------------- |
| `startedAt` | `get startedAt(): Date`         | 시작 시각                   |
| `stoppedAt` | `get stoppedAt(): Date \| null` | 종료 시각. running이면 null |
| `isRunning` | `get isRunning(): boolean`      | stoppedAt === null          |

---

## Equals

override 필요. Date는 참조 타입이므로 `.getTime()` 비교:

```typescript
equals(other: ValueObject<{ startedAt: Date; stoppedAt: Date | null }>): boolean {
  if (!(other instanceof TimeRange)) return false;
  return this.props.startedAt.getTime() === other.props.startedAt.getTime()
    && this.props.stoppedAt?.getTime() === other.props.stoppedAt?.getTime();
}
```

---

## 의존성

- `Duration` VO (`duration()` 반환 타입)

## 직렬화

없음. Repository 도입 시 추가 예정 (Domain First, Persistence Later).
