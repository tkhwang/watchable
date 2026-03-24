import { describe, it, expect } from 'vitest';
import { DOMAIN_EVENTS } from '../../../core/domain-event';
import { InvalidTimeEntryError } from '../time-entry';
import { createRunningEntry } from './fixtures/time-entry.fixture';

const EVENTS = DOMAIN_EVENTS.tracking.timeEntry;

// ── start() ──────────────────────────────────────

describe('TimeEntry', () => {
  describe('start()', () => {
    it('유효한 props로 running 상태의 TimeEntry가 생성된다', () => {
      const result = createRunningEntry();

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.taskId.value).toBe('task-1');
        expect(result.value.userId.value).toBe('user-1');
        expect(result.value.startedAt).toEqual(new Date('2026-03-24T09:00:00Z'));
      }
    });

    it('생성 시 isRunning === true', () => {
      const result = createRunningEntry();

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.isRunning()).toBe(true);
      }
    });

    it('생성 시 stoppedAt === null', () => {
      const result = createRunningEntry();

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.stoppedAt).toBeNull();
      }
    });

    it('생성 시 TimeEntryStarted 이벤트가 발행된다', () => {
      const result = createRunningEntry();

      expect(result.ok).toBe(true);
      if (result.ok) {
        const events = result.value.domainEvents;
        expect(events).toHaveLength(1);
        expect(events[0].eventName).toBe(EVENTS.STARTED);
        expect(events[0].aggregateId).toBe('entry-1');
      }
    });
  });

  // ── stop() ──────────────────────────────────────

  describe('stop()', () => {
    it('running entry를 stop하면 stopped 상태가 된다', () => {
      const result = createRunningEntry();
      if (!result.ok) throw new Error('Test setup failed');

      const entry = result.value;
      const stopTime = new Date('2026-03-24T10:00:00Z');
      entry.stop(stopTime);

      expect(entry.isRunning()).toBe(false);
      expect(entry.stoppedAt).toEqual(stopTime);
    });

    it('stop 시 TimeEntryStopped 이벤트가 발행된다', () => {
      const result = createRunningEntry();
      if (!result.ok) throw new Error('Test setup failed');

      const entry = result.value;
      entry.pullDomainEvents(); // start 이벤트 제거
      entry.stop(new Date('2026-03-24T10:00:00Z'));

      const events = entry.domainEvents;
      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe(EVENTS.STOPPED);
    });

    it('이미 stopped인 entry에 stop()하면 throw', () => {
      const result = createRunningEntry();
      if (!result.ok) throw new Error('Test setup failed');

      const entry = result.value;
      entry.stop(new Date('2026-03-24T10:00:00Z'));

      expect(() => entry.stop(new Date('2026-03-24T11:00:00Z'))).toThrow(InvalidTimeEntryError);
    });

    it('at < startedAt이면 throw', () => {
      const result = createRunningEntry({
        startedAt: new Date('2026-03-24T09:00:00Z'),
      });
      if (!result.ok) throw new Error('Test setup failed');

      expect(() => result.value.stop(new Date('2026-03-24T08:00:00Z'))).toThrow(
        InvalidTimeEntryError,
      );
    });
  });

  // ── editTimes() ─────────────────────────────────

  describe('editTimes()', () => {
    it('stopped entry의 시간을 변경할 수 있다', () => {
      const result = createRunningEntry();
      if (!result.ok) throw new Error('Test setup failed');

      const entry = result.value;
      entry.stop(new Date('2026-03-24T10:00:00Z'));

      const newStart = new Date('2026-03-24T09:30:00Z');
      const newStop = new Date('2026-03-24T10:30:00Z');
      entry.editTimes(newStart, newStop);

      expect(entry.startedAt).toEqual(newStart);
      expect(entry.stoppedAt).toEqual(newStop);
    });

    it('editTimes 시 TimeEntryEdited 이벤트가 발행된다', () => {
      const result = createRunningEntry();
      if (!result.ok) throw new Error('Test setup failed');

      const entry = result.value;
      entry.stop(new Date('2026-03-24T10:00:00Z'));
      entry.pullDomainEvents(); // 기존 이벤트 제거

      entry.editTimes(new Date('2026-03-24T09:30:00Z'), new Date('2026-03-24T10:30:00Z'));

      const events = entry.domainEvents;
      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe(EVENTS.TIMES_EDITED);
    });

    it('running entry에 editTimes하면 throw', () => {
      const result = createRunningEntry();
      if (!result.ok) throw new Error('Test setup failed');

      expect(() =>
        result.value.editTimes(new Date('2026-03-24T09:30:00Z'), new Date('2026-03-24T10:30:00Z')),
      ).toThrow(InvalidTimeEntryError);
    });

    it('stoppedAt < startedAt이면 throw', () => {
      const result = createRunningEntry();
      if (!result.ok) throw new Error('Test setup failed');

      const entry = result.value;
      entry.stop(new Date('2026-03-24T10:00:00Z'));

      expect(() =>
        entry.editTimes(new Date('2026-03-24T10:00:00Z'), new Date('2026-03-24T09:00:00Z')),
      ).toThrow(InvalidTimeEntryError);
    });
  });

  // ── duration() ──────────────────────────────────

  describe('duration()', () => {
    it('stopped entry는 정확한 Duration을 반환한다', () => {
      const result = createRunningEntry({
        startedAt: new Date('2026-03-24T09:00:00Z'),
      });
      if (!result.ok) throw new Error('Test setup failed');

      const entry = result.value;
      entry.stop(new Date('2026-03-24T10:00:00Z')); // 1시간

      expect(entry.duration().seconds).toBe(3600);
    });

    it('running entry는 now 기준 Duration을 반환한다', () => {
      const result = createRunningEntry({
        startedAt: new Date('2026-03-24T09:00:00Z'),
      });
      if (!result.ok) throw new Error('Test setup failed');

      const now = new Date('2026-03-24T09:30:00Z'); // 30분 경과
      expect(result.value.duration(now).seconds).toBe(1800);
    });
  });

  // ── isRunning() ─────────────────────────────────

  describe('isRunning()', () => {
    it('running entry면 true', () => {
      const result = createRunningEntry();
      if (!result.ok) throw new Error('Test setup failed');

      expect(result.value.isRunning()).toBe(true);
    });

    it('stopped entry면 false', () => {
      const result = createRunningEntry();
      if (!result.ok) throw new Error('Test setup failed');

      result.value.stop(new Date('2026-03-24T10:00:00Z'));
      expect(result.value.isRunning()).toBe(false);
    });
  });

  // ── equals() ────────────────────────────────────

  describe('equals()', () => {
    it('같은 ID이면 true', () => {
      const a = createRunningEntry({ id: 'entry-1' });
      const b = createRunningEntry({ id: 'entry-1', taskId: 'task-2' });

      expect(a.ok && b.ok && a.value.equals(b.value)).toBe(true);
    });

    it('다른 ID이면 false', () => {
      const a = createRunningEntry({ id: 'entry-1' });
      const b = createRunningEntry({ id: 'entry-2' });

      expect(a.ok && b.ok && a.value.equals(b.value)).toBe(false);
    });
  });
});
