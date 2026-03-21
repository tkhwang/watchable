import { ValueObject } from './value-object';
import { DomainError } from './domain-error';
import { ok, fail, type Result } from './result';

export class InvalidUniqueEntityIDError extends DomainError {
  constructor() {
    super('INVALID_UNIQUE_ENTITY_ID', 'UniqueEntityID must be a non-empty string');
  }
}

interface UniqueEntityIDProps {
  value: string;
}

export class UniqueEntityID extends ValueObject<UniqueEntityIDProps> {
  private constructor(value: string) {
    super({ value });
  }

  static create(value: string): Result<UniqueEntityID, InvalidUniqueEntityIDError> {
    if (!value || value.trim().length === 0) {
      return fail(new InvalidUniqueEntityIDError());
    }
    return ok(new UniqueEntityID(value));
  }

  get value(): string {
    return this.props.value;
  }
}
