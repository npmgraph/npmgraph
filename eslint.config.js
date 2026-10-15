import xo, { jsFilesGlob, tsFilesGlob } from 'eslint-config-xo';
import xoReact from 'eslint-config-xo-react';
import reactDoctor from 'eslint-plugin-react-doctor';
import reactYouMightNotNeedAnEffect from 'eslint-plugin-react-you-might-not-need-an-effect';
import { defineConfig } from 'eslint/config';
import selectDom from 'select-dom/eslint-plugin';

const disabledRules = [
  // TODO: Gradually review and enable
  '@typescript-eslint/consistent-type-assertions',
  '@typescript-eslint/no-shadow',
  '@typescript-eslint/no-unsafe-argument',
  '@typescript-eslint/no-unsafe-assignment',
  '@typescript-eslint/no-unsafe-member-access',
  '@typescript-eslint/no-unsafe-type-assertion',
  '@typescript-eslint/prefer-nullish-coalescing',
  '@typescript-eslint/use-unknown-in-catch-callback-variable',
  'import-x/order', // TODO: https://github.com/un-ts/eslint-plugin-import-x/pull/504 https://github.com/un-ts/eslint-plugin-import-x/pull/514
  'package-json/prefer-files-field',
  'package-json/require-engines',
  'package-json/require-entry-point',
  'regexp/no-super-linear-move',
  'unicorn/no-break-in-nested-loop',
  'unicorn/prefer-iterator-to-array', // TODO: 2027

  // Unwanted
  '@stylistic/no-mixed-operators', // Should be part of prettier:compat but it's not?
  '@typescript-eslint/naming-convention', // I don't see this happening
  '@typescript-eslint/no-empty-function', // No reason to enforce this
  '@typescript-eslint/no-restricted-types', // null ok
  '@typescript-eslint/strict-boolean-expressions', // Too strict
  'capitalized-comments',
  'no-alert',
  'no-console',
  'no-warning-comments',
  'react-doctor/jsx-no-target-blank',
  'react/jsx-no-target-blank',
  'require-unicode-regexp',
];

// eslint-disable-next-line unicorn/no-top-level-side-effects -- https://github.com/sindresorhus/eslint-plugin-unicorn/issues/3813
export default defineConfig([
  ...xo({
    browser: true,
    space: true,
    prettier: 'compat',
    gitignore: import.meta.url,
  }),
  ...xoReact({
    space: true,
    prettier: 'compat',
  }),
  {
    files: [tsFilesGlob, jsFilesGlob],
    rules: {
      'unicorn/switch-case-braces': ['error', 'avoid'],
      'unicorn/prefer-query-selector': ['error', { allowWithVariables: true }],
      'unicorn/filename-case': [
        'error',
        {
          cases: {
            kebabCase: true,
            camelCase: true,
            pascalCase: true,
          },
        },
      ],
    },
  },
  reactDoctor.configs.recommended,
  reactYouMightNotNeedAnEffect.configs.strict,
  {
    plugins: { 'select-dom': selectDom },
    rules: { 'select-dom/prefer': 'error' },
  },
  {
    rules: Object.fromEntries(disabledRules.map(rule => [rule, 'off'])),
  },
]);
