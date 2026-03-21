import { Entity } from './entity';
import type { IDomainEvent } from './domain-event';

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
