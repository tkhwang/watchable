import { describe, it, expect } from 'vitest';
import { Order, createId } from './fixtures/aggregate-root.fixture';

describe('AggregateRoot', () => {
  describe('domainEvents', () => {
    it('초기 상태에서 이벤트가 없다', () => {
      const order = Order.create(createId('o-1'), 'item-a');

      expect(order.domainEvents).toHaveLength(0);
    });

    it('커맨드 메서드 호출 시 이벤트가 수집된다', () => {
      const order = Order.create(createId('o-1'), 'item-a');
      order.confirm();

      expect(order.domainEvents).toHaveLength(1);
      expect(order.domainEvents[0].eventName).toBe('tkbetter.order.confirmed');
      expect(order.domainEvents[0].aggregateId).toBe('o-1');
    });
  });

  describe('pullDomainEvents', () => {
    it('수집된 이벤트를 반환하고 내부 목록을 비운다', () => {
      const order = Order.create(createId('o-1'), 'item-a');
      order.confirm();

      const events = order.pullDomainEvents();

      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe('tkbetter.order.confirmed');
      expect(order.domainEvents).toHaveLength(0);
    });

    it('두 번 호출하면 두 번째는 빈 배열을 반환한다', () => {
      const order = Order.create(createId('o-1'), 'item-a');
      order.confirm();

      order.pullDomainEvents();
      const secondPull = order.pullDomainEvents();

      expect(secondPull).toHaveLength(0);
    });

    it('이벤트 없이 호출해도 안전하다', () => {
      const order = Order.create(createId('o-1'), 'item-a');

      const events = order.pullDomainEvents();

      expect(events).toHaveLength(0);
    });
  });

  describe('Entity 상속', () => {
    it('equals는 Entity와 동일하게 ID 기반으로 동작한다', () => {
      const id = createId('o-1');
      const a = Order.create(id, 'item-a');
      const b = Order.create(id, 'item-b');

      expect(a.equals(b)).toBe(true);
    });
  });
});
