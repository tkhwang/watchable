import { AggregateRoot } from '../../core/aggregate-root';
import { DOMAIN_EVENTS } from '../../core/domain-event';
import { DomainError } from '../../core/domain-error';
import { type Result, ok, fail } from '../../core/result';
import { UniqueEntityID } from '../../core/unique-entity-id';
import type { Color } from '../value-objects/color';

const TASK_NAME_MAX_LENGTH = 50;
const EVENTS = DOMAIN_EVENTS.tracking.task;

// ── Error ──────────────────────────────────────────

export class InvalidTaskNameError extends DomainError {
  constructor(name: string) {
    super('INVALID_TASK_NAME', `Task name must be 1-${TASK_NAME_MAX_LENGTH} characters: "${name}"`);
  }
}

// ── Props ──────────────────────────────────────────

interface TaskProps {
  name: string;
  color: Color;
  isArchived: boolean;
  userId: UniqueEntityID;
}

// ── Task Aggregate ─────────────────────────────────

export class Task extends AggregateRoot<TaskProps> {
  private constructor(id: UniqueEntityID, props: TaskProps) {
    super(id, props);
  }

  /*
   *  Factory
   */

  static create(props: {
    id: string;
    name: string;
    color: Color;
    userId: string;
  }): Result<Task, InvalidTaskNameError> {
    const nameResult = Task.validateName(props.name);
    if (!nameResult.ok) return fail(nameResult.error);

    const idResult = UniqueEntityID.create(props.id);
    if (!idResult.ok) return fail(new InvalidTaskNameError(props.name));

    const userIdResult = UniqueEntityID.create(props.userId);
    if (!userIdResult.ok) return fail(new InvalidTaskNameError(props.name));

    const task = new Task(idResult.value, {
      name: nameResult.value,
      color: props.color,
      isArchived: false,
      userId: userIdResult.value,
    });

    task.addDomainEvent({
      eventName: EVENTS.CREATED,
      occurredOn: new Date(),
      aggregateId: props.id,
    });

    return ok(task);
  }

  /*
   *  Command
   */

  rename(name: string): void {
    const result = Task.validateName(name);
    if (!result.ok) throw result.error;

    this.props.name = result.value;
    this.addDomainEvent({
      eventName: EVENTS.RENAMED,
      occurredOn: new Date(),
      aggregateId: this.id.value,
    });
  }

  changeColor(color: Color): void {
    this.props.color = color;
    this.addDomainEvent({
      eventName: EVENTS.COLOR_CHANGED,
      occurredOn: new Date(),
      aggregateId: this.id.value,
    });
  }

  archive(): void {
    if (this.props.isArchived) return;

    this.props.isArchived = true;
    this.addDomainEvent({
      eventName: EVENTS.ARCHIVED,
      occurredOn: new Date(),
      aggregateId: this.id.value,
    });
  }

  unarchive(): void {
    if (!this.props.isArchived) return;

    this.props.isArchived = false;
    this.addDomainEvent({
      eventName: EVENTS.UNARCHIVED,
      occurredOn: new Date(),
      aggregateId: this.id.value,
    });
  }

  /*
   *  Query
   */

  canStartTimer(): boolean {
    return !this.props.isArchived;
  }

  /*
   *  Getter
   */

  get name(): string {
    return this.props.name;
  }

  get color(): Color {
    return this.props.color;
  }

  get isArchived(): boolean {
    return this.props.isArchived;
  }

  get userId(): UniqueEntityID {
    return this.props.userId;
  }

  /*
   *  Private
   */

  private static validateName(name: string): Result<string, InvalidTaskNameError> {
    const trimmed = name.trim();
    if (trimmed.length === 0 || trimmed.length > TASK_NAME_MAX_LENGTH) {
      return fail(new InvalidTaskNameError(name));
    }
    return ok(trimmed);
  }
}
