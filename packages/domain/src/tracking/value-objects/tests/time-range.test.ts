import { describe, it, expect } from 'vitest';
import { InvalidTimeRangeError, TimeRange } from '../time-range';

const T09 = new Date('2024-01-01T09:00:00Z');
const T10 = new Date('2024-01-01T10:00:00Z');
const T11 = new Date('2024-01-01T11:00:00Z');
const T08 = new Date('2024-01-01T08:00:00Z');
 
describe('TimeRange', () => {
  describe('정상적인 경우 생성에 성공한다', () => {
    it('create(09:00, 10:00)이면 startedAt/stoppedAt 일치', () => {
      const result = TimeRange.from(T09, T10);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.startedAt).toEqual(T09);
        expect(result.value.stoppedAt).toEqual(T10);
      }
    }); 

    it('create(09:00, 09:00)이면 duration 0 허용', () => {
      const result = TimeRange.from(T09, T09);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.startedAt).toEqual(T09);
        expect(result.value.stoppedAt).toEqual(T09);
      }
    });

    it('running(09:00)이면 stoppedAt === null, isRunning === true', () => {
      const range = TimeRange.start(T09);

      expect(range.stoppedAt).toBeNull();
      expect(range.isRunning).toBe(true);
    });
  });

  describe('비정상적인 경우 생성에 실패한다', () => {
    it('create(10:00, 09:00) stoppedAt < startedAt이면 InvalidTimeRangeError', () => {
      const result = TimeRange.from(T10, T09);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(InvalidTimeRangeError);
        expect(result.error.code).toBe('INVALID_TIME_RANGE');
      }
    });
  });

  // ── command ──────────────────────────────────────

  describe('command', () => {
    describe('stop()', () => {
      it('running 상태에서 stop(10:00)이면 stopped 새 인스턴스', () => {
        const range = TimeRange.start(T09);
        const result = range.stop(T10);

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.stoppedAt).toEqual(T10);
          expect(result.value.isRunning).toBe(false);
        }
      });

      it('stop(08:00) at < startedAt이면 실패', () => {
        const range = TimeRange.start(T09);
        const result = range.stop(T08);

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error).toBeInstanceOf(InvalidTimeRangeError);
        }
      });

      it('이미 stopped 상태에서 stop()이면 실패', () => {
        const createResult = TimeRange.from(T09, T10);

        expect(createResult.ok).toBe(true);
        if (createResult.ok) {
          const result = createResult.value.stop(T11);

          expect(result.ok).toBe(false);
          if (!result.ok) {
            expect(result.error).toBeInstanceOf(InvalidTimeRangeError);
          }
        }
      });
    });
  });

  // ── query ───────────────────────────────────────

  describe('query', () => {
    describe('duration', () => {
      it('stopped 상태(09:00~10:00)이면 3600초 Duration', () => {
        const result = TimeRange.from(T09, T10);

        expect(result.ok).toBe(true);
        if (result.ok) {
          const duration = result.value.duration();
          expect(duration.seconds).toBe(3600);
        }
      });

      it('running 상태에서 duration(now=11:00)이면 now - startedAt', () => {
        const range = TimeRange.start(T09);
        const duration = range.duration(T11);

        expect(duration.seconds).toBe(7200); // 2시간
      });

      it('stopped 상태에서 now를 전달해도 stoppedAt 기준으로 계산', () => {
        const result = TimeRange.from(T09, T10);

        expect(result.ok).toBe(true);
        if (result.ok) {
          const duration = result.value.duration(T11);
          expect(duration.seconds).toBe(3600); // now 무시, 1시간
        }
      });
    });
  });

 

  // ── equals & 불변성 ─────────────────────────────

  describe('equals & 불변성', () => {
    it('같은 시간이면 equals true', () => {
      const a = TimeRange.from(T09, T10);
      const b = TimeRange.from(T09, T10);

      expect(a.ok && b.ok && a.value.equals(b.value)).toBe(true);
    });

    it('다른 시간이면 equals false', () => {
      const a = TimeRange.from(T09, T10);
      const b = TimeRange.from(T09, T11);

      expect(a.ok && b.ok && a.value.equals(b.value)).toBe(false);
    });

    it('stop()은 새 인스턴스를 반환하고 원본은 불변이다', () => {
      const original = TimeRange.start(T09);
      const result = original.stop(T10);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).not.toBe(original);
        expect(original.isRunning).toBe(true);
        expect(result.value.isRunning).toBe(false);
      }
    });
  });

  // ── getter ──────────────────────────────────────

  describe('getter', () => {
    it('startedAt는 시작 시각을 반환한다', () => {
      const range = TimeRange.start(T09);

      expect(range.startedAt).toEqual(T09);
    });

    it('stoppedAt는 종료 시각을 반환한다', () => {
      const result = TimeRange.from(T09, T10);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.stoppedAt).toEqual(T10);
      }
    });

    it('isRunning은 running이면 true, stopped이면 false', () => {
      const running = TimeRange.start(T09);
      expect(running.isRunning).toBe(true);

      const result = TimeRange.from(T09, T10);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.isRunning).toBe(false);
      }
    });
  });
});
