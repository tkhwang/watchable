# Fullstack DDD Design - tkbetter Time Tracking App

> **Status**: Approved (2026-03-20)
> **Related**: [`docs/0_PRD.md`](../../0_PRD.md), [`docs/2026-03-20-time-tracking-prd.md`](../../2026-03-20-time-tracking-prd.md)

## Overview

Backend DDD 경험을 기반으로, tkbetter 프로젝트에 Backend/Frontend 모두 Tactical DDD를 적용하는 설계 문서. 논의를 통해 확정된 결정사항 6개와 미결정 사항 1개를 정리한다.

---

## 1. DDD Level: Tactical DDD

### 결정

Tactical DDD 패턴을 적용한다: Entity, Value Object, Aggregate, Repository, Domain Service.

### 배경

- Strategic DDD(Bounded Context, Context Map)는 단일 도메인(시간 추적)의 소규모 프로젝트에서는 오버엔지니어링
- Tactical DDD는 도메인 로직을 명확히 캡슐화하면서도 구현 복잡도가 적절

### 대안

| 대안                          | 불채택 이유                                     |
| ----------------------------- | ----------------------------------------------- |
| DDD-Lite (타입 + 레이어 분리) | 도메인 로직 캡슐화 부족. VO/Aggregate 활용 못함 |
| Full DDD (Strategic + CQRS)   | 단일 Bounded Context에서는 불필요한 복잡도      |

### 적용 범위

| DDD 개념           | 역할                             | 프로젝트 예시                                                                  |
| ------------------ | -------------------------------- | ------------------------------------------------------------------------------ |
| **Entity**         | 고유 ID를 가진 도메인 객체       | `Task`, `TimeEntry`, `UserProfile`                                             |
| **Value Object**   | 불변 값 타입, 행동 포함          | `Color`, `Duration`, `TimeRange`                                               |
| **Aggregate**      | 일관성 경계 단위                 | Task(독립), TimeEntry(독립), PomodoroSession(독립)                             |
| **Repository**     | 영속화 인터페이스                | `TaskRepository`, `TimeEntryRepository`, `PomodoroSessionRepository` (Phase 2) |
| **Domain Service** | Entity에 속하지 않는 도메인 로직 | `TimerService` (자동 전환, 단일 활성 제약)                                     |

---

## 2. Domain Event: 필요 시 도입

### 결정

Phase 1에서는 Domain Event를 사용하지 않는다. 필요한 시나리오가 발생하면 그때 설계한다.

### 배경

- Phase 1 MVP(Task CRUD, Start/Stop, 통계)는 단순한 command-response로 충분
- Domain Event는 복잡한 사이드 이펙트 체인이 필요할 때 가치가 있음
- 불필요한 추상화를 미리 도입하지 않는 원칙 (YAGNI)

### 대안

| 대안                           | 불채택 이유                                              |
| ------------------------------ | -------------------------------------------------------- |
| Phase 1부터 EventBus 기반 구조 | 실제 handler가 없으면 사용되지 않는 코드. 오버엔지니어링 |

### 향후 도입 시점 (예상)

- Phase 2: Pomodoro 세션 완료 → 통계 갱신
- Phase 2: 오프라인 동기화 시 이벤트 기반 처리

---

## 3. Domain Model Style: Class 기반 Rich Domain Model

### 결정

Entity와 Value Object를 class로 정의하고, 도메인 로직을 메서드로 포함하는 Rich Domain Model을 채택한다.

### 배경

- DDD의 핵심 가치인 "도메인 로직을 도메인 객체 안에 캡슐화"를 직접 경험할 수 있음
- Backend(NestJS)에서 class 기반 패턴이 자연스러움
- 이 프로젝트를 통해 DDD를 학습하고자 하는 목표에 부합

### 대안

| 대안                                        | 불채택 이유                                                         |
| ------------------------------------------- | ------------------------------------------------------------------- |
| Interface + 함수 기반 (Functional)          | 직렬화 부담 없지만, 도메인 로직이 분산됨. Rich Domain 경험에 부적합 |
| 하이브리드 (VO는 class, Entity는 interface) | 일관성 부족. 두 스타일 혼용 시 인지 부하 증가                       |

### 코드 예시: Value Object (Duration)

```typescript
// @life-logs/shared/domain/value-objects/duration.ts

export class Duration {
  private constructor(readonly seconds: number) {
    if (seconds < 0) throw new Error('Duration cannot be negative');
  }

  static fromSeconds(seconds: number): Duration {
    return new Duration(seconds);
  }

  static fromMinutes(minutes: number): Duration {
    return new Duration(minutes * 60);
  }

  static zero(): Duration {
    return new Duration(0);
  }

  get minutes(): number {
    return Math.floor(this.seconds / 60);
  }

  get hours(): number {
    return Math.floor(this.seconds / 3600);
  }

  format(): string {
    const h = this.hours;
    const m = this.minutes % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }

  add(other: Duration): Duration {
    return new Duration(this.seconds + other.seconds);
  }

  isZero(): boolean {
    return this.seconds === 0;
  }

  // Serialization
  static fromJSON(raw: { seconds: number }): Duration {
    return new Duration(raw.seconds);
  }

  toJSON(): { seconds: number } {
    return { seconds: this.seconds };
  }
}
```

### 코드 예시: Value Object (Color)

```typescript
// @life-logs/shared/domain/value-objects/color.ts

export class Color {
  private constructor(readonly hex: string) {
    if (!/^#[0-9a-fA-F]{6}$/.test(hex)) {
      throw new Error(`Invalid hex color: ${hex}`);
    }
  }

  static fromHex(hex: string): Color {
    return new Color(hex);
  }

  get rgb(): { r: number; g: number; b: number } {
    return {
      r: parseInt(this.hex.slice(1, 3), 16),
      g: parseInt(this.hex.slice(3, 5), 16),
      b: parseInt(this.hex.slice(5, 7), 16),
    };
  }

  /**
   * 배경색 위에 텍스트를 표시할 때 가독성 있는 전경색 반환
   */
  contrastTextColor(): '#000000' | '#FFFFFF' {
    const { r, g, b } = this.rgb;
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }

  // Serialization
  static fromJSON(raw: string): Color {
    return new Color(raw);
  }

  toJSON(): string {
    return this.hex;
  }
}
```

### 코드 예시: Value Object (TimeRange)

```typescript
// @life-logs/shared/domain/value-objects/time-range.ts

export class TimeRange {
  private constructor(
    readonly startedAt: Date,
    readonly stoppedAt: Date | null,
  ) {
    if (stoppedAt && stoppedAt < startedAt) {
      throw new Error('stoppedAt cannot be before startedAt');
    }
  }

  static create(startedAt: Date, stoppedAt: Date | null): TimeRange {
    return new TimeRange(startedAt, stoppedAt);
  }

  static running(startedAt: Date): TimeRange {
    return new TimeRange(startedAt, null);
  }

  get isRunning(): boolean {
    return this.stoppedAt === null;
  }

  duration(): Duration {
    const end = this.stoppedAt ?? new Date();
    const seconds = Math.floor((end.getTime() - this.startedAt.getTime()) / 1000);
    return Duration.fromSeconds(seconds);
  }

  stop(at: Date): TimeRange {
    return new TimeRange(this.startedAt, at);
  }

  // Serialization
  static fromJSON(raw: { startedAt: string; stoppedAt: string | null }): TimeRange {
    return new TimeRange(new Date(raw.startedAt), raw.stoppedAt ? new Date(raw.stoppedAt) : null);
  }

  toJSON(): { startedAt: string; stoppedAt: string | null } {
    return {
      startedAt: this.startedAt.toISOString(),
      stoppedAt: this.stoppedAt?.toISOString() ?? null,
    };
  }
}
```

### 코드 예시: Entity (Task)

> **Note**: Phase 1에서는 `icon`, `sortOrder` 필드를 생략한다. Phase 2에서 추가 예정.

```typescript
// @life-logs/shared/domain/entities/task.ts

export interface TaskJSON {
  id: string;
  userId: string;
  name: string;
  color: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export class Task {
  private constructor(
    readonly id: string,
    readonly userId: string,
    private _name: string,
    private _color: Color,
    private _isArchived: boolean,
    readonly createdAt: Date,
    private _updatedAt: Date,
  ) {}

  get name(): string {
    return this._name;
  }
  get color(): Color {
    return this._color;
  }
  get isArchived(): boolean {
    return this._isArchived;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  canStartTimer(): boolean {
    return !this._isArchived;
  }

  rename(newName: string): void {
    if (!newName.trim()) throw new Error('Task name cannot be empty');
    this._name = newName.trim();
    this._updatedAt = new Date();
  }

  changeColor(newColor: Color): void {
    this._color = newColor;
    this._updatedAt = new Date();
  }

  archive(): void {
    this._isArchived = true;
    this._updatedAt = new Date();
  }

  unarchive(): void {
    this._isArchived = false;
    this._updatedAt = new Date();
  }

  // Factory
  static create(params: { id: string; userId: string; name: string; color: Color }): Task {
    const now = new Date();
    return new Task(params.id, params.userId, params.name, params.color, false, now, now);
  }

  // Serialization
  static fromJSON(raw: TaskJSON): Task {
    return new Task(
      raw.id,
      raw.userId,
      raw.name,
      Color.fromHex(raw.color),
      raw.isArchived,
      new Date(raw.createdAt),
      new Date(raw.updatedAt),
    );
  }

  toJSON(): TaskJSON {
    return {
      id: this.id,
      userId: this.userId,
      name: this._name,
      color: this._color.toJSON(),
      isArchived: this._isArchived,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }
}
```

### 코드 예시: Entity (TimeEntry)

```typescript
// @life-logs/shared/domain/entities/time-entry.ts

export interface TimeEntryJSON {
  id: string;
  userId: string;
  taskId: string;
  startedAt: string;
  stoppedAt: string | null;
  duration: number | null;
  pomodoroSessionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export class TimeEntry {
  private constructor(
    readonly id: string,
    readonly userId: string,
    readonly taskId: string,
    private _timeRange: TimeRange,
    readonly pomodoroSessionId: string | null,
    readonly createdAt: Date,
    private _updatedAt: Date,
  ) {}

  get startedAt(): Date {
    return this._timeRange.startedAt;
  }
  get stoppedAt(): Date | null {
    return this._timeRange.stoppedAt;
  }
  get isRunning(): boolean {
    return this._timeRange.isRunning;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  duration(): Duration {
    return this._timeRange.duration();
  }

  stop(at: Date = new Date()): void {
    if (!this.isRunning) throw new Error('TimeEntry is already stopped');
    this._timeRange = this._timeRange.stop(at);
    this._updatedAt = new Date();
  }

  editTimes(startedAt: Date, stoppedAt: Date | null): void {
    this._timeRange = TimeRange.create(startedAt, stoppedAt);
    this._updatedAt = new Date();
  }

  // Factory
  static start(params: {
    id: string;
    userId: string;
    taskId: string;
    startedAt?: Date;
  }): TimeEntry {
    const now = new Date();
    return new TimeEntry(
      params.id,
      params.userId,
      params.taskId,
      TimeRange.running(params.startedAt ?? now),
      null,
      now,
      now,
    );
  }

  // Serialization
  static fromJSON(raw: TimeEntryJSON): TimeEntry {
    return new TimeEntry(
      raw.id,
      raw.userId,
      raw.taskId,
      TimeRange.create(new Date(raw.startedAt), raw.stoppedAt ? new Date(raw.stoppedAt) : null),
      raw.pomodoroSessionId,
      new Date(raw.createdAt),
      new Date(raw.updatedAt),
    );
  }

  toJSON(): TimeEntryJSON {
    const range = this._timeRange.toJSON();
    const dur = this.stoppedAt ? this.duration() : null;
    return {
      id: this.id,
      userId: this.userId,
      taskId: this.taskId,
      startedAt: range.startedAt,
      stoppedAt: range.stoppedAt,
      duration: dur?.seconds ?? null,
      pomodoroSessionId: this.pomodoroSessionId,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }
}
```

### 코드 예시: Entity (UserProfile)

> **Note**: Pomodoro 설정 필드는 Phase 1에서 기본값으로 포함. `pomodoro_sessions` 테이블은 Phase 2에서 생성.

```typescript
// @life-logs/shared/domain/entities/user-profile.ts

export interface UserProfileJSON {
  id: string;
  displayName: string;
  timezone: string;
  pomodoroFocusMin: number;
  pomodoroShortBreakMin: number;
  pomodoroLongBreakMin: number;
  createdAt: string;
  updatedAt: string;
}

export class UserProfile {
  private constructor(
    readonly id: string,
    private _displayName: string,
    private _timezone: string,
    private _pomodoroFocusMin: number,
    private _pomodoroShortBreakMin: number,
    private _pomodoroLongBreakMin: number,
    readonly createdAt: Date,
    private _updatedAt: Date,
  ) {}

  get displayName(): string {
    return this._displayName;
  }
  get timezone(): string {
    return this._timezone;
  }
  get pomodoroFocusMin(): number {
    return this._pomodoroFocusMin;
  }
  get pomodoroShortBreakMin(): number {
    return this._pomodoroShortBreakMin;
  }
  get pomodoroLongBreakMin(): number {
    return this._pomodoroLongBreakMin;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Factory
  static create(params: { id: string; displayName: string; timezone?: string }): UserProfile {
    const now = new Date();
    return new UserProfile(
      params.id,
      params.displayName,
      params.timezone ?? 'Asia/Seoul',
      25,
      5,
      15, // Pomodoro defaults
      now,
      now,
    );
  }

  // Serialization
  static fromJSON(raw: UserProfileJSON): UserProfile {
    return new UserProfile(
      raw.id,
      raw.displayName,
      raw.timezone,
      raw.pomodoroFocusMin,
      raw.pomodoroShortBreakMin,
      raw.pomodoroLongBreakMin,
      new Date(raw.createdAt),
      new Date(raw.updatedAt),
    );
  }

  toJSON(): UserProfileJSON {
    return {
      id: this.id,
      displayName: this._displayName,
      timezone: this._timezone,
      pomodoroFocusMin: this._pomodoroFocusMin,
      pomodoroShortBreakMin: this._pomodoroShortBreakMin,
      pomodoroLongBreakMin: this._pomodoroLongBreakMin,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }
}
```

### 코드 예시: Domain Service (TimerService)

```typescript
// @life-logs/shared/domain/services/timer-service.ts

export class TimerService {
  /**
   * 새 타이머를 시작한다. 기존 활성 타이머가 있으면 먼저 종료한다.
   * @returns [새 TimeEntry, 종료된 TimeEntry | null]
   */
  static startTimer(params: {
    entryId: string;
    userId: string;
    taskId: string;
    task: Task;
    activeEntry: TimeEntry | null;
  }): [newEntry: TimeEntry, stoppedEntry: TimeEntry | null] {
    const { entryId, userId, taskId, task, activeEntry } = params;

    if (!task.canStartTimer()) {
      throw new Error('Cannot start timer for archived task');
    }

    let stoppedEntry: TimeEntry | null = null;
    if (activeEntry) {
      activeEntry.stop();
      stoppedEntry = activeEntry;
    }

    const newEntry = TimeEntry.start({ id: entryId, userId, taskId });
    return [newEntry, stoppedEntry];
  }
}
```

---

## 4. Frontend DDD Level: L2 (DTO -> Domain Model Mapping)

### 결정

Frontend에서 API 응답(JSON)을 Domain class 인스턴스로 변환하여 VO의 행동(메서드)을 활용하는 L2 수준을 적용한다.

### 배경

Frontend DDD는 스펙트럼이 넓다:

| Level  | Frontend에서 하는 것               | 예시                                         |
| ------ | ---------------------------------- | -------------------------------------------- |
| **L0** | API 응답 그대로 사용               | `response.data`를 바로 UI에 바인딩           |
| **L1** | 공유 타입만 사용                   | `Task`, `TimeEntry` 타입을 shared에서 import |
| **L2** | DTO -> Domain Model 매핑           | API 응답을 도메인 객체로 변환, VO 행동 활용  |
| **L3** | Frontend에도 Repository + Use Case | 오프라인, 캐시, 낙관적 업데이트 등           |

- Phase 1 (MVP): 온라인 필수, 단순 CRUD + Start/Stop -> L2면 충분
- Phase 2+: 오프라인 동기화, 캐시 등 -> L3가 필요해질 수 있음
- L2는 DDD의 핵심 가치(VO 행동)를 Frontend에서도 경험하면서, 과도한 레이어링을 피함

### 대안

| 대안                                | 불채택 이유                                               |
| ----------------------------------- | --------------------------------------------------------- |
| L0/L1 (API 응답 직접 사용)          | VO 행동을 활용 못함. `Duration.format()` 같은 표현력 상실 |
| L3 (Frontend Repository + Use Case) | Phase 1에서는 오프라인/캐시 불필요. 오버엔지니어링        |

### Frontend에서의 사용 예시

```typescript
// React Native 컴포넌트에서
const { data: tasks } = useQuery({
  queryKey: ['tasks', 'active'],
  queryFn: async () => {
    const res = await api.get('/tasks');
    return res.data.map(Task.fromJSON);  // JSON -> Domain class
  },
});

// Domain 메서드 활용
tasks.map(task => (
  <TaskItem
    key={task.id}
    name={task.name}
    color={task.color.hex}
    textColor={task.color.contrastTextColor()}  // VO 행동!
    disabled={!task.canStartTimer()}             // Entity 행동!
  />
));

// TimeEntry에서 Duration VO 활용
const entry = TimeEntry.fromJSON(apiResponse);
<Text>{entry.duration().format()}</Text>   // "1h 30m" — VO가 포맷 로직을 가짐
```

---

## 5. Serialization: fromJSON/toJSON 우선

### 결정

Domain class에 `fromJSON()`/`toJSON()` static method를 두는 Self-hydrating Model 패턴을 기본으로 한다. 복잡도가 증가하면 별도 Mapper 클래스로 분리할 수 있다.

### 배경

Class 기반 Rich Domain Model을 선택했으므로, JSON <-> Class 인스턴스 변환이 필수적이다. 변환 전략은 3가지가 있었다:

| 방식                   | 설명                                                        |
| ---------------------- | ----------------------------------------------------------- |
| **A: fromJSON/toJSON** | Domain class 자체에 직렬화 로직 포함. 간단하고 직관적       |
| **B: Mapper Layer**    | 별도 `TaskMapper.toDomain()` / `TaskMapper.toJSON()` 클래스 |
| **C: Branded Types**   | class 없이 타입만 강화. Rich Domain Model과 거리 있음       |

### 선택 이유

- Entity 3~4개 규모에서 Mapper Layer는 불필요한 indirection
- 도메인 모델과 직렬화 로직이 한 곳에 있어 파악이 쉬움
- 나중에 필요하면 B(Mapper)로 리팩터링 가능

### Mapper 분리가 필요해지는 시점

- 같은 Entity에 대해 여러 직렬화 형식이 필요한 경우 (REST vs GraphQL vs WebSocket)
- 직렬화 로직이 복잡해져 도메인 클래스가 비대해지는 경우
- 외부 시스템 연동으로 매핑 변환이 다양해지는 경우

### 데이터 흐름

```
[Backend]                        [Network]                    [Frontend]
Task {                           JSON:                        Task {
  name: "개발"          →        {"name":"개발",      →       name: "개발"
  color: Color("#FF5733")        "color":"#FF5733"}           color: Color("#FF5733")
  canStartTimer()                                             canStartTimer() ✅
}                                                            }
  ↑ toJSON()                                                   ↑ Task.fromJSON()
```

---

## 6. Type Sharing: `@life-logs/shared` Monorepo Package

### 결정

Domain 계층(Entity, VO, Domain Service)을 `@life-logs/shared` 패키지에 위치시켜 모든 앱에서 공유한다.

### 배경

- 이미 PRD와 monorepo 설계에서 결정된 사항
- 모노레포 + 동일 언어(TypeScript) 환경에서는 shared package가 가장 자연스러운 타입 공유 방식

### 대안

| 대안            | 불채택 이유                                                     |
| --------------- | --------------------------------------------------------------- |
| OpenAPI codegen | 별도 팀일 때 유용. 모노레포에서는 오버엔지니어링                |
| tRPC            | NestJS 대신 tRPC 서버를 써야 가치 극대화. 기존 스택과 맞지 않음 |
| GraphQL codegen | 이 프로젝트 규모에서는 과함                                     |

### `@life-logs/shared` 패키지 구조 (예상)

```
packages/shared/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── task.ts              # Task Entity
│   │   │   ├── time-entry.ts        # TimeEntry Entity
│   │   │   └── user-profile.ts      # UserProfile Entity
│   │   ├── value-objects/
│   │   │   ├── color.ts             # Color VO
│   │   │   ├── duration.ts          # Duration VO
│   │   │   └── time-range.ts        # TimeRange VO
│   │   ├── services/
│   │   │   └── timer-service.ts     # TimerService Domain Service
│   │   └── repositories/
│   │       ├── task-repository.ts   # TaskRepository interface
│   │       └── time-entry-repository.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

### 핵심 원칙

- **Domain 계층은 외부 의존성이 없다** (순수 TypeScript)
- Infrastructure가 Domain의 Repository interface를 구현한다
- Value Object는 도메인 계층에서 class로 강제하고, DB에는 primitive로 저장한다

---

## 7. Frontend State Management: 미결정

### 현재 상태

구체적인 상태관리 전략은 추후 논의 예정. 아래는 논의에서 검토된 3가지 방식이다.

### 방식 1: Domain-aligned Stores (Aggregate 단위 Zustand store)

```typescript
// stores/taskStore.ts
const useTaskStore = create<TaskStore>((set) => ({
  tasks: [] as Task[],
  fetchTasks: async () => {
    const res = await api.get('/tasks');
    set({ tasks: res.data.map(Task.fromJSON) });
  },
  archiveTask: async (id: string) => {
    await api.patch(`/tasks/${id}/archive`);
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? /* archived copy */ t : t)),
    }));
  },
}));
```

- Aggregate 경계 = Store 경계로 DDD 대응이 명확
- 캐시/리페치를 직접 관리해야 하는 단점

### 방식 2: React Query + Domain Mapper

```typescript
const useActiveTasks = () =>
  useQuery({
    queryKey: ['tasks', 'active'],
    queryFn: async () => {
      const res = await api.get('/tasks');
      return res.data.map(Task.fromJSON);
    },
  });

// 컴포넌트에서
const { data: tasks } = useActiveTasks();
tasks[0].canStartTimer(); // Domain 메서드 사용 가능
```

- 서버 상태를 React Query가 관리 (캐시/리페치/로딩 자동)
- Domain 변환은 queryFn에서 처리

### 방식 3: 하이브리드 (React Query + Zustand) — 추천

```typescript
// 서버 상태 (Task 목록, TimeEntry 기록) → React Query
const { data: tasks } = useActiveTasks();

// 클라이언트 전용 상태 (타이머 UI) → Zustand
const useTimerUI = create((set) => ({
  elapsedSeconds: 0,
  isRunning: false,
  tick: () => set((s) => ({ elapsedSeconds: s.elapsedSeconds + 1 })),
}));
```

- **Task 목록, TimeEntry 기록, 통계** → 서버 데이터 = React Query
- **타이머 UI 상태 (경과 시간 카운트)** → 클라이언트 전용 = Zustand
- Domain Model 변환은 React Query의 queryFn에서 `fromJSON()` 호출

### 논의 필요 사항

- 방식 3 (하이브리드)이 추천되었으나, 최종 결정은 실제 구현 시점에서 논의 예정
- React Query의 캐시에 Domain class 인스턴스를 저장할 때의 직렬화 이슈 검토 필요
- 낙관적 업데이트(optimistic update) 패턴과 Domain Model의 조합 방안

---

## Layered Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ apps/mobile   │  │ apps/web     │  │ apps/api     │      │
│  │ (React Native)│  │ (Next.js)    │  │ (NestJS)     │      │
│  │              │  │              │  │ Controllers   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │ fromJSON()       │ fromJSON()       │              │
├─────────┼──────────────────┼──────────────────┼──────────────┤
│         │    Application Layer (Use Cases)     │              │
│         │                                     │              │
│         │    apps/api: Application Services    │              │
│         │    apps/mobile: React Query hooks    │              │
├─────────┼─────────────────────────────────────┼──────────────┤
│                     Domain Layer                             │
│                  @life-logs/shared                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │  Entities   │  │    VOs     │  │  Services  │             │
│  │ Task        │  │ Duration   │  │ TimerSvc   │             │
│  │ TimeEntry   │  │ Color      │  │            │             │
│  │ UserProfile │  │ TimeRange  │  │            │             │
│  └────────────┘  └────────────┘  └────────────┘             │
│  ┌────────────────────────────┐                              │
│  │  Repository Interfaces     │                              │
│  └────────────────────────────┘                              │
├──────────────────────────────────────────────────────────────┤
│                  Infrastructure Layer                         │
│  ┌──────────────────────────┐                                │
│  │ apps/api:                │                                │
│  │  Repository Impl         │                                │
│  │  (Supabase Client)       │                                │
│  └──────────────────────────┘                                │
└──────────────────────────────────────────────────────────────┘
```

---

## Related Documents

- PRD: [`docs/0_PRD.md`](../../0_PRD.md)
- 기술 상세 PRD: [`docs/2026-03-20-time-tracking-prd.md`](../../2026-03-20-time-tracking-prd.md)
- 구현 스텝: [`docs/1_STEPS.md`](../../1_STEPS.md)
- 모노레포 설정: [`docs/2026-03-11-monorepo-setup-design.md`](../../2026-03-11-monorepo-setup-design.md)
