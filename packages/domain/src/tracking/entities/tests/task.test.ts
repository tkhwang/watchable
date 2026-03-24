import { describe, it, expect } from 'vitest';
import { InvalidTaskNameError } from '../task';
import { Color } from '../../value-objects/color';
import { createValidTask } from './fixtures/task.fixture';

// ── create() ──────────────────────────────────────

describe('Task', () => {
  describe('create()', () => {
    describe('유효한 props로 생성에 성공한다', () => {
      it('name, color, userId, isArchived가 올바르게 설정된다', () => {
        const result = createValidTask();

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.name).toBe('Study');
          expect(result.value.color.hex).toBe('#ff5733');
          expect(result.value.userId.value).toBe('user-1');
          expect(result.value.isArchived).toBe(false);
        }
      });

      it('name 앞뒤 공백은 trim 되어 저장된다', () => {
        const result = createValidTask({ name: '  Study  ' });

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.name).toBe('Study');
        }
      });

      it('name이 50자이면 성공한다', () => {
        const name50 = 'a'.repeat(50);
        const result = createValidTask({ name: name50 });

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.name).toBe(name50);
        }
      });

      it('생성 시 isArchived는 false이다', () => {
        const result = createValidTask();

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.isArchived).toBe(false);
        }
      });
    });

    describe('비정상적인 props로 생성에 실패한다', () => {
      it('name이 빈 문자열이면 InvalidTaskNameError', () => {
        const result = createValidTask({ name: '' });

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error).toBeInstanceOf(InvalidTaskNameError);
          expect(result.error.code).toBe('INVALID_TASK_NAME');
        }
      });

      it('name이 공백만이면 InvalidTaskNameError', () => {
        const result = createValidTask({ name: '   ' });

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error).toBeInstanceOf(InvalidTaskNameError);
        }
      });

      it('name이 51자이면 InvalidTaskNameError', () => {
        const name51 = 'a'.repeat(51);
        const result = createValidTask({ name: name51 });

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error).toBeInstanceOf(InvalidTaskNameError);
        }
      });
    });

    describe('Domain Event', () => {
      it('생성 시 tracking.task.created 이벤트가 발행된다', () => {
        const result = createValidTask();

        expect(result.ok).toBe(true);
        if (result.ok) {
          const events = result.value.domainEvents;
          expect(events).toHaveLength(1);
          expect(events[0].eventName).toBe('tracking.task.created');
          expect(events[0].aggregateId).toBe('task-1');
        }
      });
    });
  });

  // ── rename() ──────────────────────────────────────

  describe('rename()', () => {
    it('유효한 name으로 변경하면 name이 업데이트된다', () => {
      const result = createValidTask();
      if (!result.ok) throw new Error('Test setup failed');

      const task = result.value;
      task.pullDomainEvents(); // create 이벤트 제거
      task.rename('Work');

      expect(task.name).toBe('Work');
    });

    it('name 앞뒤 공백은 trim 된다', () => {
      const result = createValidTask();
      if (!result.ok) throw new Error('Test setup failed');

      const task = result.value;
      task.rename('  Work  ');

      expect(task.name).toBe('Work');
    });

    it('빈 문자열이면 InvalidTaskNameError를 throw한다', () => {
      const result = createValidTask();
      if (!result.ok) throw new Error('Test setup failed');

      expect(() => result.value.rename('')).toThrow(InvalidTaskNameError);
    });

    it('51자 초과이면 InvalidTaskNameError를 throw한다', () => {
      const result = createValidTask();
      if (!result.ok) throw new Error('Test setup failed');

      expect(() => result.value.rename('a'.repeat(51))).toThrow(InvalidTaskNameError);
    });

    it('rename 시 tracking.task.renamed 이벤트가 발행된다', () => {
      const result = createValidTask();
      if (!result.ok) throw new Error('Test setup failed');

      const task = result.value;
      task.pullDomainEvents(); // create 이벤트 제거
      task.rename('Work');

      const events = task.domainEvents;
      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe('tracking.task.renamed');
    });
  });

  // ── changeColor() ─────────────────────────────────

  describe('changeColor()', () => {
    it('새 Color로 변경하면 color가 업데이트된다', () => {
      const result = createValidTask();
      if (!result.ok) throw new Error('Test setup failed');

      const newColor = '#00ff00';
      const newColorResult = Color.fromHex(newColor);
      if (!newColorResult.ok) throw new Error('Test setup: invalid color');

      const task = result.value;
      task.changeColor(newColorResult.value);

      expect(task.color.hex).toBe(newColor);
    });

    it('changeColor 시 tracking.task.color-changed 이벤트가 발행된다', () => {
      const result = createValidTask();
      if (!result.ok) throw new Error('Test setup failed');

      const newColorResult = Color.fromHex('#00ff00');
      if (!newColorResult.ok) throw new Error('Test setup: invalid color');

      const task = result.value;
      task.pullDomainEvents(); // create 이벤트 제거
      task.changeColor(newColorResult.value);

      const events = task.domainEvents;
      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe('tracking.task.color-changed');
    });
  });

  // ── archive() ─────────────────────────────────────

  describe('archive()', () => {
    it('active task를 archive하면 isArchived가 true가 된다', () => {
      const result = createValidTask();
      if (!result.ok) throw new Error('Test setup failed');

      const task = result.value;
      task.archive();

      expect(task.isArchived).toBe(true);
    });

    it('archive 시 tracking.task.archived 이벤트가 발행된다', () => {
      const result = createValidTask();
      if (!result.ok) throw new Error('Test setup failed');

      const task = result.value;
      task.pullDomainEvents(); // create 이벤트 제거
      task.archive();

      const events = task.domainEvents;
      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe('tracking.task.archived');
    });

    it('이미 archived인 task에 archive()하면 상태 유지, 이벤트 미발행', () => {
      const result = createValidTask();
      if (!result.ok) throw new Error('Test setup failed');

      const task = result.value;
      task.archive();
      task.pullDomainEvents(); // 기존 이벤트 제거

      task.archive(); // 중복 호출

      expect(task.isArchived).toBe(true);
      expect(task.domainEvents).toHaveLength(0);
    });
  });

  // ── unarchive() ───────────────────────────────────

  describe('unarchive()', () => {
    it('archived task를 unarchive하면 isArchived가 false가 된다', () => {
      const result = createValidTask();
      if (!result.ok) throw new Error('Test setup failed');

      const task = result.value;
      task.archive();
      task.unarchive();

      expect(task.isArchived).toBe(false);
    });

    it('unarchive 시 tracking.task.unarchived 이벤트가 발행된다', () => {
      const result = createValidTask();
      if (!result.ok) throw new Error('Test setup failed');

      const task = result.value;
      task.archive();
      task.pullDomainEvents(); // 기존 이벤트 제거

      task.unarchive();

      const events = task.domainEvents;
      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe('tracking.task.unarchived');
    });

    it('이미 active인 task에 unarchive()하면 상태 유지, 이벤트 미발행', () => {
      const result = createValidTask();
      if (!result.ok) throw new Error('Test setup failed');

      const task = result.value;
      task.pullDomainEvents(); // create 이벤트 제거

      task.unarchive(); // 이미 active

      expect(task.isArchived).toBe(false);
      expect(task.domainEvents).toHaveLength(0);
    });
  });

  // ── canStartTimer() ───────────────────────────────

  describe('canStartTimer()', () => {
    it('active task이면 true', () => {
      const result = createValidTask();
      if (!result.ok) throw new Error('Test setup failed');

      expect(result.value.canStartTimer()).toBe(true);
    });

    it('archived task이면 false', () => {
      const result = createValidTask();
      if (!result.ok) throw new Error('Test setup failed');

      const task = result.value;
      task.archive();

      expect(task.canStartTimer()).toBe(false);
    });
  });

  // ── equals() ──────────────────────────────────────

  describe('equals()', () => {
    it('같은 ID이면 true', () => {
      const a = createValidTask({ id: 'task-1' });
      const b = createValidTask({ id: 'task-1', name: 'Different Name' });

      expect(a.ok && b.ok && a.value.equals(b.value)).toBe(true);
    });

    it('다른 ID이면 false', () => {
      const a = createValidTask({ id: 'task-1' });
      const b = createValidTask({ id: 'task-2' });

      expect(a.ok && b.ok && a.value.equals(b.value)).toBe(false);
    });
  });
});
