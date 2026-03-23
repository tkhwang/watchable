## ADDED Requirements

### Requirement: Format 스크립트

루트 `package.json`에 `format`과 `format:check` 스크립트가 존재해야 한다.

#### Scenario: Format 실행

- **WHEN** `pnpm format`을 실행하면
- **THEN** Prettier가 프로젝트 전체 파일을 포맷팅한다

#### Scenario: Format check 실행

- **WHEN** `pnpm format:check`를 실행하면
- **THEN** Prettier가 포맷팅 위반 파일을 보고하고 위반 시 non-zero exit code를 반환한다

### Requirement: Turbo format:check pipeline

`turbo.json`에 `format:check` task가 정의되어야 한다.

#### Scenario: Turbo format:check 캐시

- **WHEN** `turbo format:check`를 실행하면
- **THEN** 소스 파일 변경이 없으면 캐시된 결과를 사용한다

### Requirement: 현재 코드 포맷 준수

기존 코드가 Prettier 설정을 준수해야 한다.

#### Scenario: Format check 통과

- **WHEN** `pnpm format:check`를 실행하면
- **THEN** 모든 파일이 통과해야 한다 (위반 파일은 `pnpm format`으로 수정)
