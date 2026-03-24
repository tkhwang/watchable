import { describe, it, expect } from 'vitest';
import { Duration, InvalidDurationError } from '../duration';

describe('Duration', () => {
  describe('정상적인 경우 생성에 성공한다', () => {
    it('fromSeconds(0)이면 seconds === 0', () => {
      const result = Duration.fromSeconds(0);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.seconds).toBe(0);
      }
    });

    it('fromSeconds(3600)이면 seconds === 3600', () => {
      const result = Duration.fromSeconds(3600);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.seconds).toBe(3600);
      }
    });

    it('fromMinutes(1.5)이면 seconds === 90', () => {
      const result = Duration.fromMinutes(1.5);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.seconds).toBe(90);
      }
    });

    it('zero()이면 seconds === 0', () => {
      const duration = Duration.zero();

      expect(duration.seconds).toBe(0);
    });
  });

  describe('비정상적인 경우 생성에 실패한다', () => {
    it('fromSeconds(-1)이면 InvalidDurationError', () => {
      const result = Duration.fromSeconds(-1);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(InvalidDurationError);
        expect(result.error.code).toBe('INVALID_DURATION');
      }
    });

    it('fromMinutes(-5)이면 InvalidDurationError', () => {
      const result = Duration.fromMinutes(-5);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(InvalidDurationError);
      }
    });
  });

  // ── command ──────────────────────────────────────

  describe('command', () => {
    describe('add', () => {
      it('두 Duration을 합산한다 (60 + 90 = 150)', () => {
        const a = Duration.fromSeconds(60);
        const b = Duration.fromSeconds(90);

        expect(a.ok && b.ok).toBe(true);
        if (a.ok && b.ok) {
          const sum = a.value.add(b.value);
          expect(sum.seconds).toBe(150);
        }
      });

      it('zero와 합산하면 원래 값과 같다', () => {
        const a = Duration.fromSeconds(60);

        expect(a.ok).toBe(true);
        if (a.ok) {
          const sum = a.value.add(Duration.zero());
          expect(sum.seconds).toBe(60);
        }
      });
    });
  });

  // ── query ───────────────────────────────────────

  describe('query', () => {
    describe('isZero', () => {
      it('0초이면 true', () => {
        expect(Duration.zero().isZero()).toBe(true);
      });

      it('1초이면 false', () => {
        const result = Duration.fromSeconds(1);

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.isZero()).toBe(false);
        }
      });
    });

    describe('format', () => {
      it('0초 → "0s"', () => {
        expect(Duration.zero().format()).toBe('0s');
      });

      it('30초 → "30s"', () => {
        const result = Duration.fromSeconds(30);
        expect(result.ok && result.value.format()).toBe('30s');
      });

      it('300초 → "5m"', () => {
        const result = Duration.fromSeconds(300);
        expect(result.ok && result.value.format()).toBe('5m');
      });

      it('330초 → "5m" (초 버림)', () => {
        const result = Duration.fromSeconds(330);
        expect(result.ok && result.value.format()).toBe('5m');
      });

      it('7200초 → "2h 0m"', () => {
        const result = Duration.fromSeconds(7200);
        expect(result.ok && result.value.format()).toBe('2h 0m');
      });

      it('5400초 → "1h 30m"', () => {
        const result = Duration.fromSeconds(5400);
        expect(result.ok && result.value.format()).toBe('1h 30m');
      });

      it('5430초 → "1h 30m" (초 버림)', () => {
        const result = Duration.fromSeconds(5430);
        expect(result.ok && result.value.format()).toBe('1h 30m');
      });

      it('86400초 → "1d 0h 0m"', () => {
        const result = Duration.fromSeconds(86400);
        expect(result.ok && result.value.format()).toBe('1d 0h 0m');
      });

      it('90000초 → "1d 1h 0m"', () => {
        const result = Duration.fromSeconds(90000);
        expect(result.ok && result.value.format()).toBe('1d 1h 0m');
      });

      it('177600초 → "2d 1h 20m"', () => {
        const result = Duration.fromSeconds(177600);
        expect(result.ok && result.value.format()).toBe('2d 1h 20m');
      });
    });
  });

  // ── getter ──────────────────────────────────────

  describe('getter', () => {
    it('seconds는 원시 초 값을 반환한다', () => {
      const result = Duration.fromSeconds(90);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.seconds).toBe(90);
      }
    });

    it('minutes는 소수점 포함 분을 반환한다 (90초 → 1.5)', () => {
      const result = Duration.fromSeconds(90);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.minutes).toBe(1.5);
      }
    });

    it('hours는 소수점 포함 시간을 반환한다 (5400초 → 1.5)', () => {
      const result = Duration.fromSeconds(5400);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.hours).toBe(1.5);
      }
    });
  });

  // ── equals & 불변성 ─────────────────────────────

  describe('equals & 불변성', () => {
    it('같은 값이면 equals true', () => {
      const a = Duration.fromSeconds(60);
      const b = Duration.fromSeconds(60);

      expect(a.ok && b.ok && a.value.equals(b.value)).toBe(true);
    });

    it('다른 값이면 equals false', () => {
      const a = Duration.fromSeconds(60);
      const b = Duration.fromSeconds(90);

      expect(a.ok && b.ok && a.value.equals(b.value)).toBe(false);
    });

    it('add는 새 인스턴스를 반환하고 원본은 불변이다', () => {
      const result = Duration.fromSeconds(60);

      expect(result.ok).toBe(true);
      if (result.ok) {
        const original = result.value;
        const sum = original.add(Duration.zero());

        expect(sum).not.toBe(original);
        expect(original.seconds).toBe(60);
      }
    });
  });
});
