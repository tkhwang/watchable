# ValueObject\<Props\>

> **파일**: `packages/domain/src/core/value-object.ts`
> **역할**: 모든 Value Object의 추상 기반 클래스

---

## 역할

- 불변 값 타입의 공통 계약 정의
- 값 동등성(structural equality) 기본 구현 제공

---

## 인터페이스

### Generic `Props`

`Props` — VO 내부 props의 shape.

| Concrete VO | Props                                          |
| ----------- | ---------------------------------------------- |
| Duration    | `{ seconds: number }`                          |
| Color       | `{ hex: string }`                              |
| TimeRange   | `{ startedAt: Date; stoppedAt: Date \| null }` |

### API

| 멤버                                        | 접근               | 설명                                         |
| ------------------------------------------- | ------------------ | -------------------------------------------- |
| `props`                                     | `protected readonly` | 내부 값 저장. `Object.freeze`로 불변 보장    |
| `constructor(props: Props)`                 | `protected`        | 서브클래스에서 `super(props)` 호출           |
| `equals(other: ValueObject<Props>): boolean`| `public`           | 기본 구현: constructor 동일 + props shallow === |

### 코드

```typescript
export abstract class ValueObject<Props> {
  protected readonly props: Readonly<Props>;

  protected constructor(props: Props) {
    this.props = Object.freeze({ ...props });
  }

  equals(other: ValueObject<Props>): boolean {
    if (this.constructor !== other.constructor) return false;
    const keys = Object.keys(this.props) as (keyof Props)[];
    return keys.every(k => this.props[k] === other.props[k]);
  }

}
```

---

## 에러 처리: Result 패턴

factory method에서 throw 대신 `Result<T, DomainError>`를 반환한다.

| 위치 | 에러 처리 | 이유 |
|------|-----------|------|
| factory method (`fromXxx`, `create`) | `Result` 반환 | 외부 입력 검증 — 실패 가능성을 타입으로 명시 |
| 내부 메서드 (`add`, `stop` 등) | throw 유지 | 이미 유효한 VO이므로 실패 불가 |

### Result 타입 (`core/result.ts`)

```typescript
export type Result<T, E = DomainError> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function fail<E>(error: E): Result<never, E> {
  return { ok: false, error };
}
```

---

## 서브클래스 패턴

- private constructor → static factory (`fromXxx()`, `create()`)
- factory는 `Result<VO, DomainError>` 반환
- `super({ field1, field2 })` 로 props 전달
- `get field()` getter로 props 접근 노출
- 원시값 props → equals 기본 구현 사용
- 참조 타입 props (Date 등) → equals override 필요

### 사용 예시: Duration (원시값 — override 불필요)

```typescript
class Duration extends ValueObject<{ seconds: number }> {
  private constructor(seconds: number) {
    super({ seconds });
  }

  static fromSeconds(seconds: number): Result<Duration, DomainError> {
    if (seconds < 0) return fail(new DomainError('Duration cannot be negative', 'INVALID_DURATION'));
    return ok(new Duration(seconds));
  }

  get seconds(): number { return this.props.seconds; }

  // 내부 메서드: 두 유효한 Duration의 합은 항상 유효 → throw 불필요
  add(other: Duration): Duration {
    return new Duration(this.seconds + other.seconds);
  }
}
```

### 사용 예시: TimeRange (Date — override 필요)

```typescript
class TimeRange extends ValueObject<{ startedAt: Date; stoppedAt: Date | null }> {
  // ...

  equals(other: ValueObject<{ startedAt: Date; stoppedAt: Date | null }>): boolean {
    if (!(other instanceof TimeRange)) return false;
    return this.props.startedAt.getTime() === other.props.startedAt.getTime()
      && this.props.stoppedAt?.getTime() === other.props.stoppedAt?.getTime();
  }
}
```

---

## Invariants

1. props는 생성 후 변경 불가 (Object.freeze)
2. 같은 타입 + 같은 값 → equals() === true
3. 다른 타입 → equals() === false (constructor 비교)

## Edge Cases

- equals()에서 다른 VO 타입과 비교 시 → false (constructor 불일치)
- props에 Date 등 참조 타입 포함 시 → shallow === 가 참조 비교 → 서브클래스 override 필요
- Object.freeze는 shallow → 중첩 객체 불변성은 보장하지 않음
