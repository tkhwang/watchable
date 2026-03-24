## Why

모노레포의 ESLint/Prettier 설정이 기본 수준으로만 구성되어 있다. 각 workspace(NestJS API, Next.js Web, React Native Mobile, Domain)별 특화 린트 규칙이 없어서 프레임워크 고유 안티패턴을 잡지 못하고, ESLint v9 flat config로 마이그레이션이 필요하다. Prettier는 이미 CLAUDE.md 컨벤션과 일치하므로 변경 불필요.

## What Changes

- ESLint를 legacy `.eslintrc.js` → flat config (`eslint.config.mjs`)로 마이그레이션
- Workspace별 ESLint 규칙 추가:
  - `packages/domain`: 순수 TypeScript strict 규칙
  - `apps/api`: NestJS 관련 규칙 (decorator 사용 패턴)
  - `apps/web`: Next.js 규칙 (`eslint-config-next`)
  - `apps/mobile`: React Native / Expo 규칙
- `format` 스크립트 추가 (Prettier 일괄 포맷팅)
- Turbo pipeline에 `format` task 추가

## Capabilities

### New Capabilities

- `eslint-flat-config`: ESLint v9 flat config 마이그레이션 및 workspace별 규칙 구성
- `format-scripts`: Prettier format 스크립트 및 Turbo pipeline 통합

### Modified Capabilities

## Impact

- 모든 workspace의 ESLint 설정 파일 변경 (`.eslintrc.js` → `eslint.config.mjs`)
- Root 및 각 workspace `package.json` 스크립트 업데이트
- `turbo.json` pipeline 업데이트
- ESLint 관련 devDependencies 업데이트 (flat config 호환 플러그인)
