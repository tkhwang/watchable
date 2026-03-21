import { DomainError } from '../../domain-error';

export class TestError extends DomainError {
  constructor(message: string) {
    super('TEST_ERROR', message);
  }
}
