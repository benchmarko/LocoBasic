
// https://eslint.org/docs/latest/use/getting-started
// ttps://typescript-eslint.io/packages/typescript-eslint/
// @ts-check

import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default defineConfig(
  js.configs.recommended,
  tseslint.configs.strict,
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'tmp/**',
    ],
  }
);
