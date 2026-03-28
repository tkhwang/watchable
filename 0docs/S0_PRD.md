# Watchable PRD

## 한 줄 요약

숏폼 영상을 무의미하게 소비하는 대신, 미리 좋은 콘텐츠를 북마크해두고 여유가 생기면 의도적으로 소비하는 습관을 만드는 개인용 도구.

## 문제

- 시간이 남으면 YouTube Shorts, 릴즈 같은 숏폼 영상을 무의미하게 소비하게 된다
- 평소 좋은 콘텐츠를 발견해도 나중에 찾기 어렵다
- 내가 어떤 콘텐츠를 얼마나 소비하는지 파악하기 어렵다

## 핵심 기능

### 1. 콘텐츠 북마크 & 상태 전이

- 좋은 콘텐츠를 발견하면 즉시 북마크한다
- 콘텐츠는 소비 상태를 가진다: `Bookmarked → InProgress → Done`
- 잠깐 여유가 생기면 북마크된 콘텐츠를 찾아서 소비한다

### 2. 소비 통계 & 인사이트

- 소비한 콘텐츠에 대한 통계를 보여준다
- 주간/월간 소비량, 카테고리별 분포 등
- 소비 패턴을 시각화하여 인사이트를 제공한다

### 3. 소비 이력 기반 추천

- 내가 소비한 콘텐츠 기반으로 다음에 볼 콘텐츠를 추천한다
- 북마크해둔 콘텐츠 중 우선순위를 제안한다

## 콘텐츠 범위

혼합형 — 미디어 유형을 가리지 않는다.

- 영상 (YouTube, 컨퍼런스 토크 등)
- 블로그 글 / 기술 아티클
- 팟캐스트
- 트윗 스레드
- 뉴스레터
- 기타

## 핵심 도메인 개념

- `Content`: 북마크된 콘텐츠 (식별 + 상태 전이 + 생애주기)
- `ContentUrl`: URL 유효성, 정규화
- `MediaType`: video | article | podcast | tweet | newsletter | other
- `Tag`: 커스텀 태그 (정규화, 길이 제한)
- `ConsumptionStatus`: Bookmarked → InProgress → Done
- `Rating`: 소비 완료 후 평가

## 비즈니스 규칙

- `Content`는 `Bookmarked → InProgress → Done` 상태 전이를 가진다
- 완료된 콘텐츠에만 `Rating`을 부여할 수 있다
- `ContentUrl`은 유효한 URL이어야 하고 정규화 규칙이 있다
- `Tag`는 정규화(소문자, 트림)와 길이 제한이 있다
- 소비 통계는 기간별, 미디어 유형별로 집계할 수 있다
- 소비 이력 기반으로 콘텐츠를 추천할 수 있다

## DDD Building Block 후보

### Value Object

- `ContentUrl`
- `MediaType`
- `Tag`
- `ConsumptionStatus`
- `Rating`

### Entity

- `Content`

### Aggregate

- `Content` Aggregate
- 콘텐츠 + 소비 상태의 일관성 경계를 관리

### Domain Service

- 소비 통계 계산
- 콘텐츠 추천 로직

### Repository

- `ContentRepository`

## 이 도메인이 DDD 설명에 좋은 이유

- 개인이 직접 사용할 수 있어 요구사항이 현실적이다
- 단순 북마크를 넘어서면 상태 전이와 규칙이 자연스럽게 등장한다
- Value Object → Entity → Aggregate 순서로 복잡도가 자연스럽게 증가한다
- 통계/추천은 Domain Service를 설명하기에 적합하다
- 프론트엔드 적용 예제로도 이어 가기 쉽다

## 본편 전개 순서

- 초반 Building Block 설명은 `ContentUrl`, `MediaType`, `Tag`, `Rating`, `ConsumptionStatus` 같은 작은 Value Object부터 시작한다
- 그다음 `Content`를 Entity로 설명한다
- 이후 `Content`를 Aggregate Root로 설명하면서 일관성 경계를 다룬다
- Domain Service에서는 소비 통계 계산이나 추천 로직처럼 여러 객체에 걸친 규칙을 다룬다
- Repository와 Application Service에서는 이 도메인을 실제 유스케이스로 연결한다
- 프론트엔드 챕터에서는 이 도메인을 화면 상태와 어떻게 분리해 운영할지 설명한다
