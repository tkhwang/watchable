## Context

현재 모노레포는 legacy `.eslintrc.js` (CommonJS) 형식의 루트 ESLint 설정을 사용 중이다. ESLint v10이 설치되어 있으나 flat config를 사용하지 않고, workspace별 특화 규칙이 없다. Prettier 설정은 `.prettierrc`에 CLAUDE.md 컨벤션과 완벽히 일치하게 구성되어 있어 변경 불필요.

**현재 설정:**

- `.eslintrc.js`: `@typescript-eslint/recommended` + `prettier` extends
- `.prettierrc`: semi, singleQuote, trailingComma:all, printWidth:100, tabWidth:2
- 각 workspace `package.json`에 `lint` 스크립트 존재
- `turbo.json`에 `lint` task 구성 완료

## Goals / Non-Goals

**Goals:**

- ESLint flat config (`eslint.config.mjs`)로 마이그레이션
- Workspace별 특화 규칙 추가 (domain, api, web, mobile)
- `pnpm format` / `pnpm format:check` 스크립트 추가
- 기존 린트 통과 상태 유지 (breaking change 없음)

**Non-Goals:**

- Prettier 설정 변경 (이미 완벽)
- 커스텀 ESLint 플러그인 작성
- Pre-commit hook 설정 (별도 change로)
- CI/CD 파이프라인 변경

## Decisions

### 1. Flat config 파일명: `eslint.config.mjs`

ESM 형식 사용. `.eslintrc.js` 삭제 후 `eslint.config.mjs`로 교체.

**대안**: `eslint.config.js` (package.json에 `"type": "module"` 필요) → 모노레포 전체에 영향을 줄 수 있어 `.mjs` 확장자 사용이 안전.

### 2. 루트 단일 flat config (workspace별 분리 X)

루트 `eslint.config.mjs`에서 파일 패턴별로 workspace 규칙을 분기한다. 각 workspace에 별도 config 파일을 두지 않는다.

**이유**: Turbo의 `lint` task이 각 workspace에서 `eslint src/`를 실행하므로, 루트 config의 파일 패턴 매칭으로 충분. 설정 파일 관리 지점이 하나로 유지된다.

**대안**: 각 workspace에 `eslint.config.mjs` 배치 → config 파편화, 중복 관리 비용 증가.

### 3. Workspace별 규칙 범위

| Workspace         | 규칙                                      | 패키지                                             |
| ----------------- | ----------------------------------------- | -------------------------------------------------- |
| `packages/domain` | strict TypeScript, no side-effect imports | `@typescript-eslint` (이미 설치)                   |
| `apps/api`        | NestJS decorator 패턴 허용                | 기존 규칙 유지                                     |
| `apps/web`        | Next.js 규칙                              | `@next/eslint-plugin-next` (Next.js에 포함)        |
| `apps/mobile`     | React Native + Expo 무시 패턴             | `eslint-plugin-react`, `eslint-plugin-react-hooks` |

### 4. Format 스크립트 구성

```
root package.json:
  "format": "prettier --write .",
  "format:check": "prettier --check ."

turbo.json:
  "format:check": {} (캐시 가능)
```

`format`은 Turbo 없이 루트에서 직접 실행 (전체 파일 대상). `format:check`는 Turbo pipeline에 추가하여 CI에서 사용 가능.

## Risks / Trade-offs

- **[Risk] Flat config 마이그레이션 시 기존 규칙 누락** → Mitigation: 마이그레이션 전후 `eslint --print-config` 출력 비교
- **[Risk] ESLint 플러그인 flat config 미지원** → Mitigation: `@typescript-eslint` v8+, `eslint-config-prettier` v10+는 flat config 지원 확인됨
- **[Risk] Next.js의 `next lint`와 루트 config 충돌** → Mitigation: `apps/web`의 lint 스크립트를 `eslint .`로 통일하고 next 규칙은 flat config에서 관리
