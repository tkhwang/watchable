# Monorepo Setup Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** pnpm workspace + Turborepo 기반 모노레포 구성 (Expo mobile, Next.js web, NestJS api, shared 패키지)

**Architecture:** 루트에서 pnpm workspace와 Turborepo로 3개 앱 + 1개 공유 패키지를 오케스트레이션. 공통 TypeScript/ESLint/Prettier 설정을 루트에서 관리하고, 각 앱이 상속.

**Tech Stack:** pnpm 10, Turborepo, Expo SDK 52+, Next.js 15, NestJS 11, TypeScript 5, ESLint 9, Prettier

---

## File Structure

### Root

- `package.json` — 루트 워크스페이스 패키지, devDependencies (turbo, eslint, prettier, typescript)
- `pnpm-workspace.yaml` — 워크스페이스 패키지 경로 정의
- `turbo.json` — 파이프라인 정의 (build, dev, lint, type-check)
- `tsconfig.base.json` — 공통 TypeScript strict 설정
- `.eslintrc.js` — 루트 ESLint 설정
- `.prettierrc` — Prettier 설정
- `.gitignore` — 루트 gitignore (node_modules, dist, .turbo 등)

### packages/shared

- `packages/shared/package.json` — `@life-logs/shared` 패키지 정의
- `packages/shared/tsconfig.json` — tsconfig.base.json extends
- `packages/shared/src/index.ts` — 진입점

### apps/api

- `apps/api/` — NestJS 프로젝트 (`nest new`로 생성 후 조정)

### apps/web

- `apps/web/` — Next.js 프로젝트 (`create-next-app`으로 생성 후 조정)

### apps/mobile

- `apps/mobile/` — Expo 프로젝트 (`create-expo-app`으로 생성 후 조정)

---

## Chunk 1: Root Configuration

### Task 1: Root package.json & pnpm workspace

**Files:**

- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `.npmrc`

- [ ] **Step 1: Create root package.json**

```json
{
  "name": "@life-logs/monorepo",
  "private": true,
  "packageManager": "pnpm@10.28.1",
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "type-check": "turbo type-check",
    "clean": "turbo clean"
  }
}
```

- [ ] **Step 2: Create pnpm-workspace.yaml**

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

- [ ] **Step 3: Create .npmrc**

```
auto-install-peers=true
```

- [ ] **Step 4: Install turbo as root devDependency**

Run: `pnpm add -D turbo -w`
Expected: turbo added to root devDependencies

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-workspace.yaml .npmrc pnpm-lock.yaml
git commit -m "chore: initialize pnpm workspace with turborepo"
```

---

### Task 2: Turborepo configuration

**Files:**

- Create: `turbo.json`

- [ ] **Step 1: Create turbo.json**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "type-check": {
      "dependsOn": ["^build"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add turbo.json
git commit -m "chore: add turborepo pipeline configuration"
```

---

### Task 3: TypeScript base configuration

**Files:**

- Create: `tsconfig.base.json`

- [ ] **Step 1: Install typescript as root devDependency**

Run: `pnpm add -D typescript -w`

- [ ] **Step 2: Create tsconfig.base.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add tsconfig.base.json package.json pnpm-lock.yaml
git commit -m "chore: add shared tsconfig base with strict settings"
```

---

### Task 4: ESLint & Prettier configuration

**Files:**

- Create: `.eslintrc.js`
- Create: `.prettierrc`
- Create: `.prettierignore`

- [ ] **Step 1: Install ESLint, Prettier and plugins**

Run: `pnpm add -D eslint prettier eslint-config-prettier eslint-plugin-prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin -w`

- [ ] **Step 2: Create .eslintrc.js**

```js
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  env: {
    node: true,
    es2022: true,
  },
  ignorePatterns: ['dist', '.next', 'node_modules', '.turbo'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
};
```

- [ ] **Step 3: Create .prettierrc**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

- [ ] **Step 4: Create .prettierignore**

```
dist
.next
node_modules
.turbo
pnpm-lock.yaml
```

- [ ] **Step 5: Commit**

```bash
git add .eslintrc.js .prettierrc .prettierignore package.json pnpm-lock.yaml
git commit -m "chore: add shared ESLint and Prettier configuration"
```

---

### Task 5: Root .gitignore

**Files:**

- Create: `.gitignore`

- [ ] **Step 1: Create .gitignore**

```
node_modules
dist
.next
.expo
.turbo
*.tsbuildinfo
.env
.env.local
.DS_Store
```

- [ ] **Step 2: Commit**

```bash
git add .gitignore
git commit -m "chore: add root gitignore"
```

---

## Chunk 2: Shared Package

### Task 6: Create packages/shared

**Files:**

- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/index.ts`

- [ ] **Step 1: Create directory**

Run: `mkdir -p packages/shared/src`

- [ ] **Step 2: Create packages/shared/package.json**

```json
{
  "name": "@life-logs/shared",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "type-check": "tsc --noEmit",
    "lint": "eslint src/"
  }
}
```

- [ ] **Step 3: Create packages/shared/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist"
  },
  "include": ["src"]
}
```

- [ ] **Step 4: Create packages/shared/src/index.ts**

```ts
export const APP_NAME = 'tkbetter';
```

- [ ] **Step 5: Commit**

```bash
git add packages/shared/
git commit -m "chore: add @life-logs/shared package"
```

---

## Chunk 3: NestJS API App

### Task 7: Create apps/api (NestJS)

**Files:**

- Create: `apps/api/` (generated by nest CLI, then adjusted)

- [ ] **Step 1: Scaffold NestJS project**

Run: `cd apps && pnpm dlx @nestjs/cli new api --package-manager pnpm --skip-git --strict`

This generates the NestJS boilerplate inside `apps/api/`.

- [ ] **Step 2: Update apps/api/package.json name**

Change the `name` field to `"@life-logs/api"`.

- [ ] **Step 3: Update apps/api/tsconfig.json to extend base**

Add `"extends": "../../tsconfig.base.json"` and keep NestJS-specific overrides.

- [ ] **Step 4: Add @life-logs/shared dependency**

Run: `pnpm --filter @life-logs/api add @life-logs/shared@workspace:*`

- [ ] **Step 5: Add lint script using root eslint**

Ensure `apps/api/package.json` scripts include:

```json
"lint": "eslint \"{src,apps,libs,test}/**/*.ts\""
```

- [ ] **Step 6: Verify NestJS builds**

Run: `pnpm --filter @life-logs/api build`
Expected: Build succeeds, dist/ created

- [ ] **Step 7: Commit**

```bash
git add apps/api/
git commit -m "feat: add NestJS API app"
```

---

## Chunk 4: Next.js Web App

### Task 8: Create apps/web (Next.js)

**Files:**

- Create: `apps/web/` (generated by create-next-app, then adjusted)

- [ ] **Step 1: Scaffold Next.js project**

Run: `pnpm dlx create-next-app@latest apps/web --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --skip-install`

- [ ] **Step 2: Update apps/web/package.json name**

Change the `name` field to `"@life-logs/web"`.

- [ ] **Step 3: Update apps/web/tsconfig.json to extend base**

Add `"extends": "../../tsconfig.base.json"` and keep Next.js-specific overrides (jsx, paths, plugins).

- [ ] **Step 4: Add @life-logs/shared dependency**

Run: `pnpm --filter @life-logs/web add @life-logs/shared@workspace:*`

- [ ] **Step 5: Add type-check script**

Add to `apps/web/package.json` scripts:

```json
"type-check": "tsc --noEmit"
```

- [ ] **Step 6: Verify Next.js builds**

Run: `pnpm --filter @life-logs/web build`
Expected: Build succeeds, .next/ created

- [ ] **Step 7: Commit**

```bash
git add apps/web/
git commit -m "feat: add Next.js web app"
```

---

## Chunk 5: Expo Mobile App

### Task 9: Create apps/mobile (Expo)

**Files:**

- Create: `apps/mobile/` (generated by create-expo-app, then adjusted)

- [ ] **Step 1: Scaffold Expo project**

Run: `pnpm dlx create-expo-app@latest apps/mobile --template blank-typescript`

- [ ] **Step 2: Update apps/mobile/package.json name**

Change the `name` field to `"@life-logs/mobile"`.

- [ ] **Step 3: Update apps/mobile/tsconfig.json to extend base**

Add `"extends": "../../tsconfig.base.json"` and keep Expo-specific overrides (jsx, paths).

- [ ] **Step 4: Add @life-logs/shared dependency**

Run: `pnpm --filter @life-logs/mobile add @life-logs/shared@workspace:*`

- [ ] **Step 5: Add lint and type-check scripts**

Add to `apps/mobile/package.json` scripts:

```json
"lint": "eslint .",
"type-check": "tsc --noEmit"
```

- [ ] **Step 6: Commit**

```bash
git add apps/mobile/
git commit -m "feat: add Expo mobile app"
```

---

## Chunk 6: Integration & Verification

### Task 10: Install all dependencies and verify

- [ ] **Step 1: Install all workspace dependencies**

Run: `pnpm install`
Expected: All packages resolved, no errors

- [ ] **Step 2: Run turbo build**

Run: `pnpm build`
Expected: All apps build successfully

- [ ] **Step 3: Run turbo lint**

Run: `pnpm lint`
Expected: No lint errors (warnings OK)

- [ ] **Step 4: Run turbo type-check**

Run: `pnpm type-check`
Expected: No type errors

- [ ] **Step 5: Verify turbo dev starts all apps**

Run: `pnpm dev` (manually verify each app starts, then Ctrl+C)

- api: http://localhost:3000
- web: http://localhost:3001 (or next available port)
- mobile: Expo dev server

- [ ] **Step 6: Commit any remaining adjustments**

```bash
git add -A
git commit -m "chore: finalize monorepo integration and verify all apps"
```
