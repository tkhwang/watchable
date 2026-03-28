# Watchable - Content Bookmarking App

## Docs

- PRD: `0docs/S0_PRD.md`
- Implementation Steps: `0docs/S1_STEPS.md`
- DDD Design: `0docs/ddd/`

## Stack

- **Monorepo**: pnpm workspaces + Turborepo
- **Backend**: NestJS 11 (`apps/api`)
- **Web**: Next.js 16, React 19, Tailwind CSS (`apps/web`)
- **Mobile**: React Native Expo 52, expo-router (`apps/mobile`)
- **Shared**: @watchable/domain - pure TypeScript DDD layer (`packages/domain`)
- **DB/Auth**: Supabase (PostgreSQL + RLS + Auth)
- **Test**: Jest (API), Vitest (domain)

## Architecture

- **Domain First, Persistence Later**: 도메인 로직 먼저 성숙 → 직렬화(`fromJSON`/`toJSON`), Repository는 나중에 도입
- **Bounded Contexts**: 세부 BC 구조는 설계 진행 시 확정. 상세: `0docs/ddd/design/`
  - `catalog/`: Content, ContentUrl, MediaType, Tag, ConsumptionStatus, Rating
  - `core/`: Shared Kernel (Entity, ValueObject, AggregateRoot, Result, DomainError)
  - BC 간 참조는 `userId` (string)만. 직접 import 금지
- **Backend**: Controller → Application Service → Domain layer
- **Frontend**: API 응답 → Domain class 매핑 후 도메인 메서드 활용
- 모든 앱은 @watchable/domain을 `workspace:*` 로 참조
- Turbo: build는 `^build` 의존, dev는 persistent

## Conventions

- Package scope: `@watchable/*`
- Prettier: semicolons, single quotes, trailing commas, 100 char, 2 spaces
- ESLint: @typescript-eslint/recommended, unused vars는 `_` prefix
- TypeScript strict mode
- Class method 순서: factory → override → command → query → getter → private (각 그룹 내 알파벳순)
- Import: barrel export(index.ts re-export) 사용 금지. 직접 파일 경로로 import (`@watchable/domain/catalog/entities/content`)

## Domain Rules

- Content 상태 전이: Bookmarked → InProgress → Done
- 완료된 콘텐츠에만 Rating 부여 가능
- ContentUrl은 유효한 URL + 정규화 규칙
- Tag는 정규화(소문자, 트림) + 길이 제한
- 직렬화(`fromJSON`/`toJSON`): Repository 도입 시 추가 (Domain First, Persistence Later)
- Phase 1: 온라인 필수, 오프라인은 Phase 2

## Dev Flow

1. **Spec first**: building block 단위로 충분히 논의 → `0docs/` 아래 spec 문서로 정리
2. **Test first**: spec 기반으로 테스트 케이스 목록 논의 → 확정
3. **TDD**: 테스트 작성 (red) → 구현 (green) → 리팩토링 (refactor)

코드 작성 전에 반드시 spec과 테스트 케이스가 합의되어야 한다.

## Phase

- **Phase 1 (MVP)**: 인증(Email/PW) + 콘텐츠 북마크 + 상태 전이 + 태그 + 평가 + 기본 통계
- **Phase 2**: 추천 + 웹 대시보드 + 브라우저 확장 + 오프라인 + OAuth
