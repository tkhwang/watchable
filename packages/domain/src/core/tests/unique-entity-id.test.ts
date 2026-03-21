import { describe, it, expect } from 'vitest';
import { UniqueEntityID, InvalidUniqueEntityIDError } from '../unique-entity-id';

describe('UniqueEntityID', () => {
  it('creates with a valid string id', () => {
    const result = UniqueEntityID.create('abc-123');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.value).toBe('abc-123');
    }
  });

  it('fails for empty string', () => {
    const result = UniqueEntityID.create('');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(InvalidUniqueEntityIDError);
    }
  });

  it('fails for whitespace-only string', () => {
    const result = UniqueEntityID.create('   ');
    expect(result.ok).toBe(false);
  });

  it('equals returns true for same id value', () => {
    const a = UniqueEntityID.create('same-id');
    const b = UniqueEntityID.create('same-id');
    expect(a.ok && b.ok && a.value.equals(b.value)).toBe(true);
  });

  it('equals returns false for different id values', () => {
    const a = UniqueEntityID.create('id-1');
    const b = UniqueEntityID.create('id-2');
    expect(a.ok && b.ok && a.value.equals(b.value)).toBe(false);
  });
});
