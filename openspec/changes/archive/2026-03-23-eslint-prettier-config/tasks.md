## 1. ESLint Flat Config 마이그레이션

- [x] 1.1 루트 `eslint.config.mjs` 생성 — 공통 TypeScript 규칙 (`@typescript-eslint/recommended`, `eslint-config-prettier`, `no-unused-vars` with `^_`) + 글로벌 ignore 패턴 (`dist`, `.next`, `node_modules`, `.turbo`, `.expo`)
- [x] 1.2 legacy `.eslintrc.js` 삭제
- [x] 1.3 `pnpm lint` 실행하여 기존 코드가 새 config으로 통과하는지 확인

## 2. Workspace별 규칙 추가

- [x] 2.1 `packages/domain` strict 규칙 추가 — `eslint.config.mjs`에 `packages/domain/**/*.ts` 패턴으로 strict TypeScript 규칙 (`explicit-function-return-type` 등) 적용
- [x] 2.2 `apps/web` Next.js 규칙 추가 — `@next/eslint-plugin-next` 설치 및 `apps/web/**/*.{ts,tsx}` 패턴 규칙 적용, `apps/web/package.json`의 lint 스크립트를 `eslint .`로 변경
- [x] 2.3 `apps/mobile` React Native 규칙 추가 — `eslint-plugin-react-hooks` 설치 및 `apps/mobile/**/*.{ts,tsx}` 패턴 규칙 적용 (eslint-plugin-react는 ESLint v10 미호환으로 제외)
- [x] 2.4 각 workspace에서 `pnpm lint` 개별 통과 확인

## 3. Format 스크립트 추가

- [x] 3.1 루트 `package.json`에 `"format": "prettier --write ."` 및 `"format:check": "prettier --check ."` 스크립트 추가
- [x] 3.2 `turbo.json`에 `"format:check": {}` task 추가
- [x] 3.3 `pnpm format:check` 실행하여 현재 코드 포맷 준수 확인, 위반 있으면 `pnpm format`으로 수정

## 4. 검증

- [x] 4.1 `pnpm lint` — 전체 workspace 린트 통과
- [x] 4.2 `pnpm format:check` — 전체 포맷 통과
- [x] 4.3 `pnpm type-check` — 타입 체크 통과 (변경으로 인한 regression 없음)
