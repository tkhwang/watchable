import { describe, it, expect } from 'vitest';
import { Money, Price } from './fixtures/value-object.fixture';

describe('ValueObject', () => {
  it('equals returns true for same type with same values', () => {
    const a = Money.create(100, 'USD');
    const b = Money.create(100, 'USD');
    expect(a.ok && b.ok && a.value.equals(b.value)).toBe(true);
  });

  it('equals returns false for same type with different values', () => {
    const a = Money.create(100, 'USD');
    const b = Money.create(200, 'USD');
    expect(a.ok && b.ok && a.value.equals(b.value)).toBe(false);
  });

  it('equals returns false for different VO types with same props shape', () => {
    const money = Money.create(100, 'USD');
    const price = Price.create(100, 'USD');
    expect(money.ok && price.ok && money.value.equals(price.value)).toBe(false);
  });

  it('props are frozen and cannot be mutated', () => {
    const result = Money.create(100, 'USD');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(() => {
        (result.value as any).props.amount = 999;
      }).toThrow();
    }
  });

  it('create returns fail for invalid input', () => {
    const result = Money.create(-1, 'USD');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('INVALID_MONEY');
    }
  });
});
