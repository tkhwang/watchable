import type { Result } from '../../../../core/result';
import { TimeEntry, InvalidTimeEntryError } from '../../time-entry';

/** Helper: create a running TimeEntry (test-only) */
export function createRunningEntry(overrides?: {
  id?: string;
  taskId?: string;
  userId?: string;
  startedAt?: Date;
}): Result<TimeEntry, InvalidTimeEntryError> {
  return TimeEntry.start({
    id: overrides?.id ?? 'entry-1',
    taskId: overrides?.taskId ?? 'task-1',
    userId: overrides?.userId ?? 'user-1',
    startedAt: overrides?.startedAt ?? new Date('2026-03-24T09:00:00Z'),
  });
}
