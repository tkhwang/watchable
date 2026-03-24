import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import nextPlugin from '@next/eslint-plugin-next';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

export default tseslint.config(
  // ── Global ignores ────────────────────────────────
  {
    ignores: ['dist/**', '.next/**', 'node_modules/**', '.turbo/**', '.expo/**'],
  },

  // ── Base: all TypeScript files ────────────────────
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },

  // ── Web app: Next.js rules ─────────────────────────
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    plugins: { '@next/next': nextPlugin },
    rules: { ...nextPlugin.configs.recommended.rules },
  },

  // ── Mobile app: React hooks rules ──────────────────
  {
    files: ['apps/mobile/**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooksPlugin },
    rules: { ...reactHooksPlugin.configs['recommended-latest'].rules },
  },

  // ── Domain package: strict rules ──────────────────
  {
    files: ['packages/domain/src/**/*.ts'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        { allowExpressions: true, allowTypedFunctionExpressions: true },
      ],
    },
  },
);
