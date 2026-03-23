# AggregateRoot\<Props\>

> **파일**: `packages/domain/src/core/aggregate-root.ts`
> **역할**: Aggregate Root 추상 기반 클래스 (Entity 확장)

---

## 역할

- 트랜잭션 일관성 경계의 진입점
- 도메인 이벤트 수집 (collect) — 발행(dispatch)은 Application Service가 담당

---

## Entity vs AggregateRoot

|               | Entity | AggregateRoot   |
| ------------- | ------ | --------------- |
| ID + Props    | ✓      | ✓ (상속)        |
| equals        | ✓      | ✓ (상속)        |
| 도메인 이벤트 | ✗      | ✓ (수집 + pull) |

---

## IDomainEvent

> **파일**: `packages/domain/src/core/domain-event.ts`

```typescript
export interface IDomainEvent {
  /** 이벤트 식별자. 컨벤션: `{boundedContext}.{eventName}` */
  readonly eventName: string;

  /** 이벤트가 발생한 시각 */
  readonly occurredOn: Date;

  /** 이벤트를 발행한 Aggregate Root의 ID */
  readonly aggregateId: string;
}
```

---

## 인터페이스

### API

| 멤버                                        | 접근           | 설명                                           |
| ------------------------------------------- | -------------- | ---------------------------------------------- |
| `domainEvents`                              | `get` (public) | 수집된 이벤트 목록 (`readonly IDomainEvent[]`) |
| `addDomainEvent(event: IDomainEvent): void` | `protected`    | 이벤트 수집 — Aggregate 커맨드 메서드에서 호출 |
| `pullDomainEvents(): IDomainEvent[]`        | `public`       | 이벤트 반환 + 내부 목록 비우기 (원자적)        |

### 코드

```typescript
export abstract class AggregateRoot<Props> extends Entity<Props> {
  #domainEvents: IDomainEvent[] = [];

  protected addDomainEvent(event: IDomainEvent): void {
    this.#domainEvents.push(event);
  }

  pullDomainEvents(): IDomainEvent[] {
    const events = this.#domainEvents;
    this.#domainEvents = [];
    return events;
  }

  get domainEvents(): readonly IDomainEvent[] {
    return this.#domainEvents;
  }
}
```

---

## 사용 패턴

### Aggregate에서 이벤트 수집

```typescript
class Task extends AggregateRoot<{ name: string; isArchived: boolean }> {
  archive(): void {
    this.props.isArchived = true;
    this.addDomainEvent({
      eventName: 'tkbetter.task.archived',
      occurredOn: new Date(),
      aggregateId: this.id.value,
    });
  }
}
```

### Application Service에서 이벤트 발행

```typescript
// Application Service
async archiveTask(taskId: string): Promise<void> {
  const task = await this.taskRepo.findById(taskId);
  task.archive();
  await this.taskRepo.save(task);

  const events = task.pullDomainEvents();
  await this.eventDispatcher.dispatchAll(events);
}
```

---

## Invariants

1. `addDomainEvent`는 protected — Aggregate 외부에서 직접 호출 불가
2. `pullDomainEvents()`는 반환 후 내부 목록을 비움 — 같은 이벤트가 두 번 발행되지 않음
3. `domainEvents` getter는 `readonly` 배열 — 외부에서 수정 불가
4. `#domainEvents`는 JS native private — 서브클래스에서도 직접 접근 불가

## Edge Cases

- `pullDomainEvents()` 두 번 호출 시 두 번째는 빈 배열 반환
- 이벤트 없이 `pullDomainEvents()` 호출해도 안전 (빈 배열)
- `domainEvents` getter는 내부 배열 참조를 직접 반환하지만 `readonly` 타입으로 보호
