import type { Result } from '../../../../core/result';
import { Task, InvalidTaskNameError } from '../../task';
import { Color } from '../../../value-objects/color';

/** Helper: create a valid Task or return Result (test-only) */
export function createValidTask(overrides?: {
  id?: string;
  name?: string;
  userId?: string;
}): Result<Task, InvalidTaskNameError> {
  const colorResult = Color.fromHex('#ff5733');
  if (!colorResult.ok) throw new Error('Test setup: invalid color');

  return Task.create({
    id: overrides?.id ?? 'task-1',
    name: overrides?.name ?? 'Study',
    color: colorResult.value,
    userId: overrides?.userId ?? 'user-1',
  });
}
