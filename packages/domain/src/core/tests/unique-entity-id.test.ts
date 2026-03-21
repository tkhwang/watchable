import { describe, it, expect } from 'vitest';
import { UniqueEntityID, InvalidUniqueEntityIDError } from '../unique-entity-id';

describe('UniqueEntityID', () => {
  describe('create', () => {
    describe('정상적인 경우 생성에 성공한다', () => {
      it('유효한 문자열로 생성하면 값에 접근 가능', () => {
        const result = UniqueEntityID.create('abc-123');

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.value).toBe('abc-123');
        }
      });
    });

    describe('비정상적인 경우 생성에 실패한다', () => {
      it('빈 문자열이면 실패한다', () => {
        const result = UniqueEntityID.create('');

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error).toBeInstanceOf(InvalidUniqueEntityIDError);
        }
      });

      it('공백만 있으면 실패한다', () => {
        const result = UniqueEntityID.create('   ');

        expect(result.ok).toBe(false);
      });
    });
  });

  describe('equals', () => {
    it('같은 값 → true', () => {
      const a = UniqueEntityID.create('same-id');
      const b = UniqueEntityID.create('same-id');

      expect(a.ok && b.ok && a.value.equals(b.value)).toBe(true);
    });

    it('다른 값 → false', () => {
      const a = UniqueEntityID.create('id-1');
      const b = UniqueEntityID.create('id-2');

      expect(a.ok && b.ok && a.value.equals(b.value)).toBe(false);
    });
  });
});
