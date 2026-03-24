import { AggregateRoot } from '../../core/aggregate-root';
import { DOMAIN_EVENTS } from '../../core/domain-event';
import { DomainError } from '../../core/domain-error';
import { type Result, ok, fail } from '../../core/result';
import { UniqueEntityID } from '../../core/unique-entity-id';
import type { Duration } from '../value-objects/duration';
import { TimeRange } from '../value-objects/time-range';

const EVENTS = DOMAIN_EVENTS.tracking.timeEntry;

// ── Error ──────────────────────────────────────────

export class InvalidTimeEntryError extends DomainError {
  constructor(message: string) {
    super('INVALID_TIME_ENTRY', message);
  }
}

// ── Props ──────────────────────────────────────────

interface TimeEntryProps {
  taskId: UniqueEntityID;
  timeRange: TimeRange;
  userId: UniqueEntityID;
}

// ── TimeEntry Aggregate ────────────────────────────

export class TimeEntry extends AggregateRoot<TimeEntryProps> {
  private constructor(id: UniqueEntityID, props: TimeEntryProps) {
    super(id, props);
  }

  /*
   *  Factory
   */

  static start(props: {
    id: string;
    taskId: string;
    userId: string;
    startedAt: Date;
  }): Result<TimeEntry, InvalidTimeEntryError> {
    const idResult = UniqueEntityID.create(props.id);
    if (!idResult.ok) return fail(new InvalidTimeEntryError('Invalid id'));

    const taskIdResult = UniqueEntityID.create(props.taskId);
    if (!taskIdResult.ok) return fail(new InvalidTimeEntryError('Invalid taskId'));

    const userIdResult = UniqueEntityID.create(props.userId);
    if (!userIdResult.ok) return fail(new InvalidTimeEntryError('Invalid userId'));

    const entry = new TimeEntry(idResult.value, {
      taskId: taskIdResult.value,
      timeRange: TimeRange.start(props.startedAt),
      userId: userIdResult.value,
    });

    entry.addDomainEvent({
      eventName: EVENTS.STARTED,
      occurredOn: new Date(),
      aggregateId: props.id,
    });

    return ok(entry);
  }

  /*
   *  Command
   */

  stop(at: Date): void {
    const result = this.props.timeRange.stop(at);
    if (!result.ok) throw new InvalidTimeEntryError(result.error.message);

    this.props.timeRange = result.value;
    this.addDomainEvent({
      eventName: EVENTS.STOPPED,
      occurredOn: new Date(),
      aggregateId: this.id.value,
    });
  }

  editTimes(startedAt: Date, stoppedAt: Date): void {
    if (this.props.timeRange.isRunning) {
      throw new InvalidTimeEntryError('Cannot edit times while running');
    }

    const result = TimeRange.from(startedAt, stoppedAt);
    if (!result.ok) throw new InvalidTimeEntryError(result.error.message);

    this.props.timeRange = result.value;
    this.addDomainEvent({
      eventName: EVENTS.TIMES_EDITED,
      occurredOn: new Date(),
      aggregateId: this.id.value,
    });
  }

  /*
   *  Query
   */

  duration(now?: Date): Duration {
    return this.props.timeRange.duration(now);
  }

  isRunning(): boolean {
    return this.props.timeRange.isRunning;
  }

  /*
   *  Getter
   */

  get taskId(): UniqueEntityID {
    return this.props.taskId;
  }

  get timeRange(): TimeRange {
    return this.props.timeRange;
  }

  get userId(): UniqueEntityID {
    return this.props.userId;
  }

  get startedAt(): Date {
    return this.props.timeRange.startedAt;
  }

  get stoppedAt(): Date | null {
    return this.props.timeRange.stoppedAt;
  }
}
