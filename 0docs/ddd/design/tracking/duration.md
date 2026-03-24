# Duration

> **파일**: `packages/domain/src/tracking/value-objects/duration.ts`
> **BC**: Tracking
> **역할**: 시간 길이를 초 단위로 표현하는 Value Object

---

## Props

```typescript
{
  seconds: number;
}
```

## 불변식

- `seconds >= 0` (음수 불가)

## Error

```typescript
export class InvalidDurationError extends DomainError {
  constructor(seconds: number) {
    super('INVALID_DURATION', `Duration cannot be negative: ${seconds}s`);
  }
}
```

---

## API (method 순서: factory → command → query → getter)

### Factory

| 메서드        | 시그니처                                                    | 설명                                  |
| ------------- | ----------------------------------------------------------- | ------------------------------------- |
| `fromSeconds` | `(seconds: number): Result<Duration, InvalidDurationError>` | seconds < 0이면 실패                  |
| `fromMinutes` | `(minutes: number): Result<Duration, InvalidDurationError>` | minutes × 60 → seconds. 음수면 실패   |
| `zero`        | `(): Duration`                                              | 0초 Duration. 항상 성공 (Result 없음) |

### Command

| 메서드 | 시그니처                      | 설명                                                |
| ------ | ----------------------------- | --------------------------------------------------- |
| `add`  | `(other: Duration): Duration` | 두 Duration의 합. 항상 유효 → 새 인스턴스 직접 반환 |

### Query

| 메서드   | 시그니처      | 설명                                     |
| -------- | ------------- | ---------------------------------------- |
| `format` | `(): string`  | 사람이 읽을 수 있는 형식. 아래 규칙 참조 |
| `isZero` | `(): boolean` | seconds === 0                            |

#### format() 규칙

- 분 미만: 초 표시
- 분 이상: 초 버리고, 최대 단위부터 분까지 모든 자리 표시 (0이어도)

| 범위       | 출력 예시                                 |
| ---------- | ----------------------------------------- |
| 0초        | `"0s"`                                    |
| 1~59초     | `"30s"`                                   |
| 1분 이상   | `"5m"`                                    |
| 1시간 이상 | `"2h 0m"`, `"1h 30m"`                     |
| 1일 이상   | `"1d 0h 0m"`, `"1d 1h 0m"`, `"2d 1h 20m"` |

### Getter

| 메서드    | 시그니처                | 설명                                        |
| --------- | ----------------------- | ------------------------------------------- |
| `seconds` | `get seconds(): number` | 원시 초 값                                  |
| `minutes` | `get minutes(): number` | seconds / 60 (소수점 포함, e.g. 90초 → 1.5) |
| `hours`   | `get hours(): number`   | seconds / 3600 (소수점 포함)                |

---

## Equals

기본 구현 사용 (`seconds` 원시값 → shallow `===` 비교). override 불필요.

---

## 직렬화

없음. Repository 도입 시 `fromJSON()`/`toJSON()` 추가 예정 (Domain First, Persistence Later).
