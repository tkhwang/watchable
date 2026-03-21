import { AggregateRoot } from '../../aggregate-root';
import { UniqueEntityID } from '../../unique-entity-id';
import type { IDomainEvent } from '../../domain-event';

export class Order extends AggregateRoot<{ item: string; confirmed: boolean }> {
  private constructor(id: UniqueEntityID, props: { item: string; confirmed: boolean }) {
    super(id, props);
  }
 
  static create(id: UniqueEntityID, item: string): Order {
    return new Order(id, { item, confirmed: false });
  }

  confirm(): void {
    this.props.confirmed = true;
    this.addDomainEvent({
      eventName: 'tkbetter.order.confirmed',
      occurredOn: new Date(),
      aggregateId: this.id.value,
    });
  }

  get item(): string { return this.props.item; }
  get confirmed(): boolean { return this.props.confirmed; }
}

/** Helper: create UniqueEntityID or throw (test-only) */
export function createId(value: string): UniqueEntityID {
  const result = UniqueEntityID.create(value);
  if (!result.ok) throw new Error(`Invalid test ID: ${value}`);
  return result.value;
}
