import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended';

//
//...eslintPluginPrettier
export default defineConfig({
  files: ['src/**/*.ts', 'eslint.config.ts'],
  extends: [eslint.configs.recommended, tseslint.configs.recommendedTypeChecked as any, eslintPluginPrettier],
  languageOptions: {
    parserOptions: {
      sourceType: 'module',
      project: './tsconfig.json',
      tsconfigRootDir: __dirname,
    },
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    'prettier/prettier': 'warn',
  },
});
