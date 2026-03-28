# Watchable - Implementation Steps

## 개발 워크플로우

각 빌딩 블록은 **Spec → Test → Impl** 순서로 개발한다.

- **Spec**: `0docs/ddd/design/` 에 설계 문서 작성 (invariants, 핵심 행동, edge cases)
- **Test (Red)**: spec 기반 테스트 작성 → 모든 테스트 실패 확인
- **Impl (Green → Refactor)**: 최소 구현 → 통과 → 리팩터링

---

## Phase 0: 프로젝트 셋업

- [ ] 모노레포 설정 (pnpm + Turborepo)
- [ ] 앱 스캐폴딩 (`apps/mobile`, `apps/web`, `apps/api`, `packages/domain`)
- [ ] 패키지 스코프 `@watchable/*` 전환
- [ ] PRD 작성 (`0docs/S0_PRD.md`)
- [ ] ESLint/Prettier 설정

## Phase 1: MVP (핵심 가치 검증)

> 기능 단위 vertical slice: 각 슬라이스가 끝나면 동작하는 기능이 하나 완성됨.

### D0: Shared Domain Model 구현

> **패키지**: `@watchable/domain` (`packages/domain/src/`)
> **워크플로우**: Spec → Test → Impl (TDD)
> **의존성**: `Base Classes → Value Object → Entity/Aggregate → Domain Service`

#### Base Classes

> `packages/domain/src/core/` — 모든 VO·Entity·Aggregate가 상속하는 추상 기반 (기존 재활용)

- [ ] `DomainError` — abstract class, code + message
- [ ] `Result` — `ok()` / `fail()` 헬퍼
- [ ] `ValueObject<Props>` — props freeze, equals
- [ ] `UniqueEntityID` — ValueObject 상속, 빈 문자열 검증
- [ ] `Entity<Props>` — UniqueEntityID + props
- [ ] `IDomainEvent` — interface + `DOMAIN_EVENTS` 상수
- [ ] `AggregateRoot<Props>` — Entity 확장, 도메인 이벤트 수집

#### Value Objects

> `packages/domain/src/catalog/value-objects/` — 세부 설계는 각 Spec에서 확정

- [ ] `ContentUrl` — URL 유효성 검증, 정규화
- [ ] `MediaType` — video | article | podcast | tweet | newsletter | other
- [ ] `Tag` — 커스텀 태그 (정규화, 길이 제한)
- [ ] `ConsumptionStatus` — Bookmarked → InProgress → Done 상태 전이
- [ ] `Rating` — 소비 완료 후 평가

#### Entity / Aggregate

> `packages/domain/src/catalog/entities/`

- [ ] `Content` — Aggregate Root (ContentUrl + MediaType + Tags + ConsumptionStatus + Rating)

#### Domain Service

- [ ] 소비 통계 계산 (기간별, 미디어 유형별 집계)

#### Repository Interface

- [ ] `ContentRepository` — Content 영속화 인터페이스

#### 공통 패턴

- **Class 기반 Rich Domain Model**: 도메인 로직을 메서드로 캡슐화
- **Private constructor + Static factory**: `create()` → `Result<T, DomainError>` 반환
- **Domain First, Persistence Later**: `fromJSON()` / `toJSON()` 은 Repository 도입 시 추가
- **외부 의존성 없음**: 순수 TypeScript만 사용

---

### S0: 프로젝트 기반 (Supabase + API 클라이언트)

- [ ] Supabase 프로젝트 생성 및 환경변수 설정 (`.env`)
- [ ] `apps/api`: Supabase 클라이언트 연결
- [ ] `apps/mobile`: API 클라이언트 설정
- [ ] 앱 ↔ 서버 통신 확인 (health check)

### S1: 회원가입/로그인

- [ ] DB: `user_profiles` 테이블 + RLS
- [ ] API: 인증 엔드포인트 (signup, login, logout, me)
- [ ] Mobile: 회원가입/로그인 화면, 인증 상태 관리
- [ ] 검증: 가입 → 로그인 → 프로필 조회 동작 확인

### S2: 콘텐츠 북마크 (생성/목록)

- [ ] DB: `contents` 테이블 + RLS
- [ ] API: `POST /contents`, `GET /contents`
- [ ] Mobile: 콘텐츠 목록 화면, 북마크 생성 화면 (URL + 미디어 타입)
- [ ] 검증: 콘텐츠 북마크 → 목록에 표시 확인

### S3: 상태 전이 (Bookmarked → InProgress → Done)

- [ ] API: `PATCH /contents/:id/status`
- [ ] Mobile: 상태 변경 UI, 상태별 필터링
- [ ] 검증: 상태 전이 규칙 (순방향만 가능 등) 동작 확인

### S4: 태그 & 필터링

- [ ] API: 태그 CRUD, 태그 기반 필터링
- [ ] Mobile: 태그 관리 UI, 필터링 UI
- [ ] 검증: 태그 추가/제거, 태그별 콘텐츠 필터링 확인

### S5: 평가 + 기본 통계 → MVP 완성

- [ ] API: 완료 콘텐츠 평가 (`Rating`), 기본 통계 (기간별/미디어별)
- [ ] Mobile: 평가 UI, 통계 화면
- [ ] 검증: 완료 콘텐츠만 평가 가능, 통계 정확성 확인 → **MVP 완성**

---

## Phase 2: 사용성 확장

- [ ] 소비 이력 기반 콘텐츠 추천
- [ ] 웹 대시보드 (`apps/web`: 소비 트렌드, 카테고리 분포)
- [ ] 브라우저 확장 (빠른 북마크)
- [ ] 오프라인 지원 (로컬 캐시 + 동기화)
- [ ] OAuth (Google, Apple Sign-In)

## Phase 3: 고도화

- [ ] 고급 분석 (장기 트렌드, 소비 패턴 인사이트)
- [ ] 데이터 내보내기 (CSV, JSON)
- [ ] 과금 체계 도입
