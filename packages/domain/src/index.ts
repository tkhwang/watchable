export const APP_NAME = 'life-logs';

// core
export { ValueObject } from './core/value-object';
export { Entity } from './core/entity';
export { AggregateRoot } from './core/aggregate-root';
export { UniqueEntityID, InvalidUniqueEntityIDError } from './core/unique-entity-id';
export { DomainError } from './core/domain-error';
export { ok, fail } from './core/result';
export type { Result } from './core/result';
export type { IDomainEvent } from './core/domain-event';
