import { describe, it, expect } from 'vitest';
import { ok, fail } from '../result';
import { DomainError } from '../domain-error';
import { TestError } from './fixtures/domain-error.fixture';

describe('Result', () => {
  it('ok()는 성공 결과를 생성한다', () => {
    const result = ok(42);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(42);
    }
  });

  it('fail()은 실패 결과를 생성한다', () => {
    const error = new TestError('bad');
    const result = fail(error);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(error);
      expect(result.error.message).toBe('bad');
      expect(result.error.code).toBe('TEST_ERROR');
    }
  });
});

describe('DomainError', () => {
  it('Error와 DomainError의 instanceof이다', () => {
    const err = new TestError('msg');

    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(DomainError);
    expect(err).toBeInstanceOf(TestError);
  });

  it('name은 서브클래스 이름을 반영한다', () => {
    const err = new TestError('something failed');

    expect(err.name).toBe('TestError');
    expect(err.code).toBe('TEST_ERROR');
    expect(err.message).toBe('something failed');
  });
});
