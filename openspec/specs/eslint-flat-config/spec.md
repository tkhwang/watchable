## ADDED Requirements

### Requirement: ESLint flat config 파일 존재

프로젝트 루트에 `eslint.config.mjs` 파일이 존재하고, legacy `.eslintrc.js`는 삭제되어야 한다.

#### Scenario: Flat config 파일 확인

- **WHEN** 프로젝트 루트를 확인하면
- **THEN** `eslint.config.mjs`가 존재하고 `.eslintrc.js`는 존재하지 않아야 한다

### Requirement: 공통 TypeScript 규칙 적용

모든 `.ts`, `.tsx` 파일에 `@typescript-eslint/recommended` 규칙과 `eslint-config-prettier` 비활성화가 적용되어야 한다.

#### Scenario: TypeScript 파일 린트

- **WHEN** 임의의 `.ts` 파일에 대해 ESLint를 실행하면
- **THEN** `@typescript-eslint/recommended` 규칙이 적용되고 Prettier와 충돌하는 규칙은 비활성화된다

#### Scenario: 언더스코어 prefix 미사용 변수 허용

- **WHEN** `_`로 시작하는 미사용 변수가 있으면
- **THEN** `@typescript-eslint/no-unused-vars` 경고가 발생하지 않아야 한다

### Requirement: Domain 패키지 strict 규칙

`packages/domain/**/*.ts` 파일에는 추가적인 strict TypeScript 규칙이 적용되어야 한다.

#### Scenario: Domain 순수 TypeScript 검증

- **WHEN** `packages/domain/` 내의 TypeScript 파일을 린트하면
- **THEN** 공통 규칙에 더해 `@typescript-eslint/explicit-function-return-type` 등 strict 규칙이 적용된다

### Requirement: Web 앱 Next.js 규칙

`apps/web/**/*.{ts,tsx}` 파일에는 Next.js 전용 규칙이 적용되어야 한다.

#### Scenario: Next.js 린트 규칙 적용

- **WHEN** `apps/web/` 내의 파일을 린트하면
- **THEN** `@next/eslint-plugin-next` 규칙이 적용된다

### Requirement: Mobile 앱 React Native 규칙

`apps/mobile/**/*.{ts,tsx}` 파일에는 React/React Hooks 규칙이 적용되어야 한다.

#### Scenario: React Native 린트 규칙 적용

- **WHEN** `apps/mobile/` 내의 파일을 린트하면
- **THEN** `eslint-plugin-react`와 `eslint-plugin-react-hooks` 규칙이 적용된다

### Requirement: 글로벌 ignore 패턴

빌드 산출물 및 캐시 디렉토리는 린트 대상에서 제외되어야 한다.

#### Scenario: Ignore 패턴 확인

- **WHEN** `dist/`, `.next/`, `node_modules/`, `.turbo/`, `.expo/` 경로의 파일을 린트하면
- **THEN** ESLint가 해당 파일을 무시해야 한다

### Requirement: 기존 코드 린트 통과

마이그레이션 후 기존 코드가 새로운 config으로 린트를 통과해야 한다.

#### Scenario: 전체 린트 실행

- **WHEN** `pnpm lint`를 실행하면
- **THEN** 모든 workspace에서 에러 없이 통과해야 한다
