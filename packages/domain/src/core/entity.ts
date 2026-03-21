import { UniqueEntityID } from './unique-entity-id';

export abstract class Entity<Props> {
  readonly id: UniqueEntityID;
  protected props: Props;

  protected constructor(id: UniqueEntityID, props: Props) {
    this.id = id;
    this.props = props;
  }

  // ── 하위 클래스 필수 구현 ─────────────────────────
  // static create(...): Result<T, DomainError>
  // → 각 Entity가 자체 검증 로직과 함께 구현
  // → protected constructor이므로 하위 클래스의 create()를 통해서만 인스턴스 생성 가능

  equals(entity?: Entity<Props>): boolean {
    if (!entity) return false;
    if (this.constructor !== entity.constructor) return false;
    return this.id.equals(entity.id);
  }
}
