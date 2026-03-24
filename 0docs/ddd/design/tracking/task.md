# Task

> **파일**: `packages/domain/src/tracking/entities/task.ts`
> **BC**: Tracking
> **상속**: `AggregateRoot<TaskProps>`
> **역할**: 시간 기록 대상. 생성/수정/아카이브 + 타이머 시작 가능 여부 판단

---

## Props

```typescript
{
  name: string;
  color: Color;
  isArchived: boolean;
  userId: string;
}
```

## 불변식

- `name`: trim 후 1~50자 (빈 문자열, 공백만, 51자 이상 불가)
- `color`: 유효한 Color VO
- `userId`: non-empty string
- `isArchived`: boolean (생성 시 `false`)

## Error

```typescript
export class InvalidTaskNameError extends DomainError {
  constructor(name: string) {
    super('INVALID_TASK_NAME', `Task name must be 1-50 characters: "${name}"`);
  }
}
```

---

## API (method 순서: factory → command → query → getter → private)

### Factory

| 메서드   | 시그니처                                                                                                  | 설명                                                 |
| -------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `create` | `(props: { id: string, name: string, color: Color, userId: string }): Result<Task, InvalidTaskNameError>` | trim + 검증. isArchived=false. TaskCreated 이벤트 발행 |

### Command (void, throw on invariant violation)

| 메서드        | 시그니처                  | 설명                                                          |
| ------------- | ------------------------- | ------------------------------------------------------------- |
| `rename`      | `(name: string): void`    | trim + 검증. 실패 시 throw InvalidTaskNameError. TaskRenamed  |
| `changeColor` | `(color: Color): void`    | Color VO는 이미 검증됨. TaskColorChanged 이벤트               |
| `archive`     | `(): void`                | isArchived = true. 멱등 (이미 archived면 이벤트 미발행)       |
| `unarchive`   | `(): void`                | isArchived = false. 멱등 (이미 active면 이벤트 미발행)        |

### Query

| 메서드          | 시그니처          | 설명          |
| --------------- | ----------------- | ------------- |
| `canStartTimer` | `(): boolean`     | `!isArchived` |

### Getter

| 메서드       | 시그니처                    | 설명 |
| ------------ | --------------------------- | ---- |
| `name`       | `get name(): string`        |      |
| `color`      | `get color(): Color`        |      |
| `isArchived` | `get isArchived(): boolean` |      |
| `userId`     | `get userId(): string`      |      |

### Private

| 메서드         | 시그니처                                                      | 설명                          |
| -------------- | ------------------------------------------------------------- | ----------------------------- |
| `validateName` | `static validateName(name: string): Result<string, InvalidTaskNameError>` | trim + 길이 검증. 성공 시 trim된 name 반환 |

---

## Domain Events

| 이벤트                       | 발행 시점     | 조건                     |
| ---------------------------- | ------------- | ------------------------ |
| `tracking.task.created`      | `create()`    | 항상                     |
| `tracking.task.renamed`      | `rename()`    | 항상 (검증 통과 시)      |
| `tracking.task.color-changed`| `changeColor()` | 항상                   |
| `tracking.task.archived`     | `archive()`   | isArchived가 false→true  |
| `tracking.task.unarchived`   | `unarchive()` | isArchived가 true→false  |

---

## Equals

기본 구현 사용 (Entity.equals — ID 비교). override 불필요.

---

## 의존성

- `Color` VO (`color` prop)
- `AggregateRoot` base class
- `UniqueEntityID` (Entity ID)
- `Result`, `DomainError`

## 직렬화

없음. Repository 도입 시 `fromJSON()`/`toJSON()` 추가 예정 (Domain First, Persistence Later).
