export interface IDomainEvent {
  readonly eventName: string;

  readonly occurredOn: Date;

  readonly aggregateId: string;
}

export const DOMAIN_EVENTS = {
  tracking: {
    task: {
      CREATED: 'tracking.task.created',
      RENAMED: 'tracking.task.renamed',
      COLOR_CHANGED: 'tracking.task.color-changed',
      ARCHIVED: 'tracking.task.archived',
      UNARCHIVED: 'tracking.task.unarchived',
    },
  },
} as const;
