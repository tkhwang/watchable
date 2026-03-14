# Monorepo Setup Design

## Overview

pnpm workspace + Turborepo 기반 모노레포. React Native Expo (mobile), Next.js (web), NestJS (api) 3개 앱과 공유 패키지 1개로 구성.

## Directory Structure

```
/
├── apps/
│   ├── mobile/          # React Native Expo (SDK 52+)
│   ├── web/             # Next.js 15 (App Router)
│   └── api/             # NestJS 11
├── packages/
│   └── shared/          # 공유 타입, 상수, 유틸
├── turbo.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── .eslintrc.js
├── .prettierrc
└── package.json
```

## Tech Stack

- **Package Manager**: pnpm (v10)
- **Build Orchestration**: Turborepo
- **Mobile**: Expo (SDK 52+), `npx create-expo-app`
- **Web**: Next.js 15 (App Router), `npx create-next-app`
- **API**: NestJS 11, `nest new`
- **Shared**: TypeScript only (types, constants, utils)

## Turborepo Pipeline

- **build**: 각 앱 빌드, `shared`에 의존
- **dev**: 개발서버, persistent, 캐시 없음
- **lint**: 전체 린트
- **type-check**: 전체 타입 체크

## TypeScript

- 루트 `tsconfig.base.json`에 공통 strict 설정
- 각 앱이 extends로 상속

## ESLint / Prettier

- 루트에 통합 ESLint + Prettier 설정
- 공통 규칙: `@typescript-eslint/recommended`, Prettier 연동
- 각 앱은 루트 설정 상속 + 프레임워크별 플러그인 추가

## Package References

- Scope: `@tkbetter`
- workspace protocol: `"@tkbetter/shared": "workspace:*"`
