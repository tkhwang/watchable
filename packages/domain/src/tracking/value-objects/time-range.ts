import { DomainError } from '../../core/domain-error';
import { type Result, ok, fail } from '../../core/result';
import { ValueObject } from '../../core/value-object';
import { Duration } from './duration';

// ── Error ──────────────────────────────────────────

export class InvalidTimeRangeError extends DomainError {
  constructor(message: string) {
    super('INVALID_TIME_RANGE', message);
  }
}

// ── TimeRange VO ───────────────────────────────────

type TimeRangeProps = { startedAt: Date; stoppedAt: Date | null };

export class TimeRange extends ValueObject<TimeRangeProps> {
  private constructor(startedAt: Date, stoppedAt: Date | null) {
    super({ startedAt, stoppedAt });
  }

  /*
   *  Factory
   */

  static from(startedAt: Date, stoppedAt: Date | null): Result<TimeRange, InvalidTimeRangeError> {
    if (stoppedAt !== null && stoppedAt.getTime() < startedAt.getTime()) {
      return fail(new InvalidTimeRangeError('stoppedAt must be >= startedAt'));
    }
    return ok(new TimeRange(startedAt, stoppedAt));
  }

  static start(at: Date): TimeRange {
    return new TimeRange(at, null);
  }

  /*
   *  Override
   */

  equals(other: ValueObject<TimeRangeProps>): boolean {
    if (!(other instanceof TimeRange)) return false;
    return (
      this.props.startedAt.getTime() === other.props.startedAt.getTime() &&
      this.props.stoppedAt?.getTime() === other.props.stoppedAt?.getTime()
    );
  }

  /*
   *  Command
   */

  stop(at: Date): Result<TimeRange, InvalidTimeRangeError> {
    if (!this.isRunning) {
      return fail(new InvalidTimeRangeError('Already stopped'));
    }
    if (at.getTime() < this.startedAt.getTime()) {
      return fail(new InvalidTimeRangeError('stop time must be >= startedAt'));
    }
    return ok(new TimeRange(this.startedAt, at));
  }

  /*
   *  Query
   */

  duration(now?: Date): Duration {
    const end = this.props.stoppedAt ?? now ?? new Date();
    const seconds = Math.floor((end.getTime() - this.props.startedAt.getTime()) / 1000);
    const result = Duration.fromSeconds(seconds);
    if (!result.ok) return Duration.zero();
    return result.value;
  }

  /*
   *  Getter
   */

  get isRunning(): boolean {
    return this.props.stoppedAt === null;
  }

  get startedAt(): Date {
    return this.props.startedAt;
  }

  get stoppedAt(): Date | null {
    return this.props.stoppedAt;
  }
}
