import { ValueObject } from '../../value-object';
import { ok, fail, type Result } from '../../result';
import { DomainError } from '../../domain-error';

class InvalidMoneyError extends DomainError {
  constructor(amount: number) {
    super('INVALID_MONEY', `Amount must be non-negative: ${amount}`);
  }
}

export class Money extends ValueObject<{ amount: number; currency: string }> {
  private constructor(amount: number, currency: string) {
    super({ amount, currency });
  }

  static create(amount: number, currency: string): Result<Money, InvalidMoneyError> {
    if (amount < 0) return fail(new InvalidMoneyError(amount));
    return ok(new Money(amount, currency));
  }

  get amount(): number { return this.props.amount; }
  get currency(): string { return this.props.currency; }
}

export class Price extends ValueObject<{ amount: number; currency: string }> {
  private constructor(amount: number, currency: string) {
    super({ amount, currency });
  }

  static create(amount: number, currency: string): Result<Price, InvalidMoneyError> {
    if (amount < 0) return fail(new InvalidMoneyError(amount));
    return ok(new Price(amount, currency));
  }

  get amount(): number { return this.props.amount; }
  get currency(): string { return this.props.currency; }
}
