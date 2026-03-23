import { describe, it, expect } from 'vitest';
import { Money, Price } from './fixtures/value-object.fixture';

describe('ValueObject', () => {
  describe('create', () => {
    describe('정상적인 경우 생성에 성공한다', () => {
      it('유효한 값으로 생성하면 props에 접근 가능', () => {
        const result = Money.create(100, 'USD');

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.amount).toBe(100);
          expect(result.value.currency).toBe('USD');
        }
      });
    });

    describe('비정상적인 경우 생성에 실패한다', () => {
      it('음수 금액이면 실패한다', () => {
        const result = Money.create(-1, 'USD');

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe('INVALID_MONEY');
        }
      });
    });
  });

  describe('equals', () => {
    it('같은 타입 + 같은 값 → true', () => {
      const a = Money.create(100, 'USD');
      const b = Money.create(100, 'USD');

      expect(a.ok && b.ok && a.value.equals(b.value)).toBe(true);
    });

    it('같은 타입 + 다른 값 → false', () => {
      const a = Money.create(100, 'USD');
      const b = Money.create(200, 'USD');

      expect(a.ok && b.ok && a.value.equals(b.value)).toBe(false);
    });

    it('다른 VO 타입 + 같은 props shape → false', () => {
      const money = Money.create(100, 'USD');
      const price = Price.create(100, 'USD');

      expect(money.ok && price.ok && money.value.equals(price.value)).toBe(false);
    });
  });

  describe('불변성', () => {
    it('props는 frozen되어 변경 불가', () => {
      const result = Money.create(100, 'USD');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (result.value as any).props.amount = 999;
        }).toThrow();
      }
    });
  });
});
