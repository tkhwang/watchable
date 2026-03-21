export abstract class ValueObject<Props> {
  protected readonly props: Readonly<Props>;

  protected constructor(props: Props) {
    this.props = Object.freeze({ ...props });
  }

  // ── 하위 클래스 필수 구현 ─────────────────────────
  // static create(...): Result<T, DomainError>
  // → 각 VO가 자체 검증 로직과 함께 구현
  // → protected constructor이므로 하위 클래스의 create()를 통해서만 인스턴스 생성 가능

  equals(other: ValueObject<Props>): boolean {
    if (this.constructor !== other.constructor) return false;
    const keys = Object.keys(this.props) as (keyof Props)[];
    return keys.every((k) => this.props[k] === other.props[k]);
  }
}
