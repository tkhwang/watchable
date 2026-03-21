# Life Logs - Time Tracking App

## Docs

- PRD: `0docs/S0_PRD.md`
- Tech Spec: `0docs/specs/2026-03-20-time-tracking-prd.md`
- DDD Design: `0docs/ddd/`

## Stack

- **Monorepo**: pnpm workspaces + Turborepo
- **Backend**: NestJS 11 (`apps/api`)
- **Web**: Next.js 16, React 19, Tailwind CSS (`apps/web`)
- **Mobile**: React Native Expo 52, expo-router (`apps/mobile`)
- **Shared**: @life-logs/domain - pure TypeScript DDD layer (`packages/domain`)
- **DB/Auth**: Supabase (PostgreSQL + RLS + Auth)
- **Test**: Jest (API), Vitest (domain)

## Architecture

- DDD 중심 개발: 비즈니스 로직은 반드시 domain layer에 먼저 구현
- Domain layer (`packages/domain`): Entity, ValueObject, AggregateRoot, Result — 외부 의존성 없음 (pure TypeScript)
- **Backend**: Controller → Application Service → Domain layer. 비즈니스 로직은 Domain에, 인프라는 Infrastructure에
- **Frontend**: API 응답 → Domain class 매핑 후 도메인 메서드 활용 (e.g. `task.canStartTimer()`, `color.contrastTextColor()`)
- 모든 앱은 @life-logs/domain을 `workspace:*` 로 참조
- Turbo: build는 `^build` 의존, dev는 persistent

## Conventions

- Package scope: `@life-logs/*`
- Prettier: semicolons, single quotes, trailing commas, 100 char, 2 spaces
- ESLint: @typescript-eslint/recommended, unused vars는 `_` prefix
- TypeScript strict mode
- 시간: UTC 저장, 클라이언트에서 유저 timezone 변환
- Class method 순서: factory → command → query → getter → private (각 그룹 내 알파벳순)

## Domain Rules

- Single active timer per user (DB partial unique index로 강제)
- Archived task에는 타이머 시작 불가
- 새 task 시작 시 기존 active timer 자동 종료
- Domain classes: `fromJSON()`/`toJSON()` 직렬화 패턴
- Phase 1: 온라인 필수, 오프라인은 Phase 2

## Dev Flow

1. **Spec first**: building block 단위로 충분히 논의 → `0docs/` 아래 spec 문서로 정리
2. **Test first**: spec 기반으로 테스트 케이스 목록 논의 → 확정
3. **TDD**: 테스트 작성 (red) → 구현 (green) → 리팩토링 (refactor)

코드 작성 전에 반드시 spec과 테스트 케이스가 합의되어야 한다.

## Phase

- **Phase 1 (MVP)**: 인증(Email/PW) + Task CRUD + 시간 기록 + 기본 통계
- **Phase 2**: Pomodoro + 웹 대시보드 + 오프라인 + OAuth
