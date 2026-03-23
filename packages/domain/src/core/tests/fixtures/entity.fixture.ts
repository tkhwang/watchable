import { Entity } from '../../entity';
import { UniqueEntityID } from '../../unique-entity-id';
import { DomainError } from '../../domain-error';
import { ok, fail, type Result } from '../../result';

export class InvalidUserEmailError extends DomainError {
  constructor() {
    super('INVALID_USER_EMAIL', 'Email must contain @');
  }
}

export class User extends Entity<{ name: string; email: string }> {
  private constructor(id: UniqueEntityID, props: { name: string; email: string }) {
    super(id, props);
  }

  static create(
    id: UniqueEntityID,
    name: string,
    email: string,
  ): Result<User, InvalidUserEmailError> {
    if (!email.includes('@')) return fail(new InvalidUserEmailError());
    return ok(new User(id, { name, email }));
  }

  get name(): string {
    return this.props.name;
  }
  get email(): string {
    return this.props.email;
  }

  rename(newName: string): void {
    this.props.name = newName;
  }
}

export class Post extends Entity<{ title: string }> {
  private constructor(id: UniqueEntityID, props: { title: string }) {
    super(id, props);
  }

  static create(id: UniqueEntityID, title: string): Post {
    return new Post(id, { title });
  }
}

/** Helper: create UniqueEntityID or throw (test-only) */
export function createId(value: string): UniqueEntityID {
  const result = UniqueEntityID.create(value);
  if (!result.ok) throw new Error(`Invalid test ID: ${value}`);
  return result.value;
}
