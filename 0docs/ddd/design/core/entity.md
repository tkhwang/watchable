# Entity\<Props\>

> **파일**: `packages/domain/src/core/entity.ts`
> **역할**: 모든 Entity의 추상 기반 클래스

---

## 역할

- ID 기반 동등성 (identity equality)
- 가변 상태를 props 객체로 캡슐화

---

## ValueObject vs Entity

|        | ValueObject                 | Entity                     |
| ------ | --------------------------- | -------------------------- |
| 동등성 | 값 비교 (props shallow ===) | ID 비교 (`UniqueEntityID`) |
| 가변성 | 불변 (Object.freeze)        | 가변 (mutation methods)    |
| Props  | `Readonly<Props>`           | `Props` (가변)             |

> `createdAt`/`updatedAt`은 도메인 로직이 아닌 영속화 관심사이므로 base에 포함하지 않는다.
> DB(Supabase)에서 자동 관리한다.

---

## 인터페이스

### Generic `Props`

`Props` — Entity 내부 가변 상태의 shape.

| Concrete Entity | Props                                                                         |
| --------------- | ----------------------------------------------------------------------------- |
| Task            | `{ name: string; color: Color; isArchived: boolean }`                         |
| TimeEntry       | `{ taskId: string; timeRange: TimeRange; pomodoroSessionId: string \| null }` |
| UserProfile     | `{ displayName: string; timezone: string; pomodoroFocusMin: number; ... }`    |

### API

| 멤버                                      | 접근        | 설명                                   |
| ----------------------------------------- | ----------- | -------------------------------------- |
| `id`                                      | `readonly`  | `UniqueEntityID` VO                    |
| `props`                                   | `protected` | 내부 가변 상태 (freeze 없음)           |
| `constructor(id, props)`                  | `protected` | 서브클래스에서 `super(id, props)` 호출 |
| `equals(entity?: Entity<Props>): boolean` | `public`    | constructor 체크 + ID 기반 동등성      |

### 코드

```typescript
export abstract class Entity<Props> {
  readonly id: UniqueEntityID;
  protected props: Props;

  protected constructor(id: UniqueEntityID, props: Props) {
    this.id = id;
    this.props = props;
  }

  // ── 하위 클래스 필수 구현 ─────────────────────────
  // static create(...): Result<T, DomainError>
  // → 각 Entity가 자체 검증 로직과 함께 구현
  // → protected constructor이므로 하위 클래스의 create()를 통해서만 인스턴스 생성 가능

  equals(entity?: Entity<Props>): boolean {
    if (!entity) return false;
    if (this.constructor !== entity.constructor) return false;
    return this.id.equals(entity.id);
  }
}
```

---

## 에러 처리

| 위치                                     | 에러 처리     | 이유                                                 |
| ---------------------------------------- | ------------- | ---------------------------------------------------- |
| factory method (`create`, `fromJSON`)    | `Result` 반환 | 외부 입력 검증 — 실패 가능성을 타입으로 명시         |
| mutation method (`rename`, `archive` 등) | throw         | 이미 유효한 Entity이므로 검증 실패는 프로그래밍 에러 |

---

## 서브클래스 패턴

- private constructor → static factory (`create()`, `fromJSON()`)
- factory는 `Result<Entity, DomainError>` 반환
- `super(id, props)` 로 base 초기화
- `get field()` getter로 props 접근 노출
- mutation method에서 `this.props.field = ...`

### 사용 예시: Task

```typescript
class Task extends Entity<{ name: string; color: Color; isArchived: boolean }> {
  private constructor(
    id: UniqueEntityID,
    props: { name: string; color: Color; isArchived: boolean },
  ) {
    super(id, props);
  }

  // Factory
  static create(params: {
    id: UniqueEntityID;
    name: string;
    color: Color;
  }): Result<Task, EmptyTaskNameError> {
    if (!params.name.trim()) return fail(new EmptyTaskNameError());
    return ok(
      new Task(params.id, { name: params.name.trim(), color: params.color, isArchived: false }),
    );
  }

  // Getters
  get name(): string {
    return this.props.name;
  }
  get color(): Color {
    return this.props.color;
  }
  get isArchived(): boolean {
    return this.props.isArchived;
  }

  // Mutations (throw)
  rename(newName: string): void {
    if (!newName.trim()) throw new EmptyTaskNameError();
    this.props.name = newName.trim();
  }

  archive(): void {
    this.props.isArchived = true;
  }
}
```

---

## Invariants

1. `id`는 생성 후 변경 불가 (readonly UniqueEntityID)
2. 같은 타입 + 같은 id → `equals()` === true (props가 달라도)
3. 다른 타입 → `equals()` === false (constructor 비교)
4. undefined/null 비교 → `equals()` === false

## Edge Cases

- `equals()`는 constructor 체크로 다른 Entity 타입 간 ID 충돌 방지 (`Task#1 !== TimeEntry#1`)
- props는 freeze 안 됨 — mutation method를 통해서만 변경하는 것은 관례적 보장
