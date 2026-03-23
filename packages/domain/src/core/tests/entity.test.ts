import { describe, it, expect } from 'vitest';
import { User, Post, InvalidUserEmailError, createId } from './fixtures/entity.fixture';

describe('Entity', () => {
  describe('create', () => {
    describe('정상적인 경우 생성에 성공한다', () => {
      it('유효한 입력으로 생성하면 props에 접근 가능', () => {
        const result = User.create(createId('u-1'), 'Alice', 'alice@test.com');

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.name).toBe('Alice');
          expect(result.value.email).toBe('alice@test.com');
        }
      });
    });

    describe('비정상적인 경우 생성에 실패한다', () => {
      it('유효하지 않은 이메일이면 실패한다', () => {
        const result = User.create(createId('u-1'), 'Alice', 'invalid-email');

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error).toBeInstanceOf(InvalidUserEmailError);
          expect(result.error.code).toBe('INVALID_USER_EMAIL');
        }
      });
    });
  });

  describe('equals', () => {
    it('같은 타입 + 같은 id → true (props가 달라도)', () => {
      const id = createId('user-1');
      const a = User.create(id, 'Alice', 'alice@test.com');
      const b = User.create(id, 'Bob', 'bob@test.com');

      expect(a.ok && b.ok && a.value.equals(b.value)).toBe(true);
    });

    it('같은 타입 + 다른 id → false', () => {
      const a = User.create(createId('id-1'), 'Alice', 'a@test.com');
      const b = User.create(createId('id-2'), 'Alice', 'a@test.com');

      expect(a.ok && b.ok && a.value.equals(b.value)).toBe(false);
    });

    it('다른 Entity 타입 + 같은 id → false', () => {
      const id = createId('shared-id');
      const user = User.create(id, 'Alice', 'a@test.com');
      const post = Post.create(id, 'Hello');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(user.ok && user.value.equals(post as any)).toBe(false);
    });

    it('undefined → false', () => {
      const result = User.create(createId('u-1'), 'Alice', 'a@test.com');

      expect(result.ok && result.value.equals(undefined)).toBe(false);
    });
  });

  describe('mutation', () => {
    it('mutation method로 props 변경 가능', () => {
      const result = User.create(createId('u-1'), 'Alice', 'a@test.com');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.name).toBe('Alice');
        result.value.rename('Bob');
        expect(result.value.name).toBe('Bob');
      }
    });
  });
});
