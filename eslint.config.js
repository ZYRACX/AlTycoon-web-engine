import js from '@eslint/js';
export default [
  js.configs.recommended,
  {
    ignores: ['node_modules', '.pnpm-store', 'coverage'],
    languageOptions: { globals: { crypto: 'readonly', structuredClone: 'readonly' } },
  },
];
