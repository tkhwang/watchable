import { describe, it, expect } from 'vitest';
import { ok, fail } from '../result';
import { DomainError } from '../domain-error';
import { TestError } from './fixtures/domain-error.fixture';

describe('Result', () => {
  it('ok() creates a success result with value', () => {
    const result = ok(42);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(42);
    }
  }); 

  it('fail() creates a failure result with error', () => {
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
  it('is instanceof Error and DomainError', () => {
    const err = new TestError('msg');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(DomainError);
    expect(err).toBeInstanceOf(TestError);
  });

  it('name reflects the subclass constructor name', () => {
    const err = new TestError('something failed');
    expect(err.name).toBe('TestError');
    expect(err.code).toBe('TEST_ERROR');
    expect(err.message).toBe('something failed');
  });
});
