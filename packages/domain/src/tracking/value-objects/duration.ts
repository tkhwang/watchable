import { DomainError } from '../../core/domain-error';
import { type Result, ok, fail } from '../../core/result';
import { ValueObject } from '../../core/value-object';

// ── Error ──────────────────────────────────────────

export class InvalidDurationError extends DomainError {
  constructor(seconds: number) {
    super('INVALID_DURATION', `Duration cannot be negative: ${seconds}s`);
  }
}

// ── Duration VO ────────────────────────────────────

export class Duration extends ValueObject<{ seconds: number }> {
  private constructor(seconds: number) {
    super({ seconds });
  }

  /*
   *  Factory
   */

  static fromMinutes(minutes: number): Result<Duration, InvalidDurationError> {
    return Duration.fromSeconds(minutes * 60);
  }

  static fromSeconds(seconds: number): Result<Duration, InvalidDurationError> {
    if (seconds < 0) return fail(new InvalidDurationError(seconds));
    return ok(new Duration(seconds));
  }

  static zero(): Duration {
    return new Duration(0);
  }

  /*
   *  Command
   */

  add(other: Duration): Duration {
    return new Duration(this.seconds + other.seconds);
  }

  /*
   *  Query
   */

  format(): string {
    const total = this.seconds;

    const d = Math.floor(total / 86400);
    const h = Math.floor((total % 86400) / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;

    // 1일 이상: d h m (모든 자리 표시)
    if (d > 0) return `${d}d ${h}h ${m}m`;

    // 1시간 이상: h m (모든 자리 표시)
    if (h > 0) return `${h}h ${m}m`;

    // 1분 이상: m (초 버림)
    if (m > 0) return `${m}m`;

    // 분 미만: 초
    return `${s}s`;
  }

  isZero(): boolean {
    return this.seconds === 0;
  }

  /*
   *  Getter
   */

  get hours(): number {
    return this.props.seconds / 3600;
  }

  get minutes(): number {
    return this.props.seconds / 60;
  }

  get seconds(): number {
    return this.props.seconds;
  }
}
