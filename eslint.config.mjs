import prettierConflicts from 'eslint-config-prettier';
import xo, { jsFilesGlob, tsFilesGlob } from 'eslint-config-xo';
import xoReact from 'eslint-config-xo-react';
import { defineConfig } from 'eslint/config';

const disabledRules = [
  // TODO: Gradually review and enable
  '@stylistic/jsx-self-closing-comp',
  'jsx-a11y-x/alt-text',
  '@typescript-eslint/array-type',
  '@typescript-eslint/consistent-generic-constructors',
  '@typescript-eslint/consistent-indexed-object-style',
  '@typescript-eslint/consistent-type-assertions',
  '@typescript-eslint/member-ordering',
  '@typescript-eslint/naming-convention',
  '@typescript-eslint/no-base-to-string',
  '@typescript-eslint/no-dynamic-delete',
  '@typescript-eslint/no-empty-function',
  '@typescript-eslint/no-restricted-types',
  '@typescript-eslint/no-shadow',
  '@typescript-eslint/no-unsafe-argument',
  '@typescript-eslint/no-unsafe-assignment',
  '@typescript-eslint/no-unsafe-member-access',
  '@typescript-eslint/no-unsafe-type-assertion',
  '@typescript-eslint/no-unused-private-class-members',
  '@typescript-eslint/no-useless-default-assignment',
  '@typescript-eslint/non-nullable-type-assertion-style',
  '@typescript-eslint/prefer-includes',
  '@typescript-eslint/prefer-nullish-coalescing',
  '@typescript-eslint/prefer-optional-chain',
  '@typescript-eslint/prefer-readonly',
  '@typescript-eslint/prefer-regexp-exec',
  '@typescript-eslint/restrict-template-expressions',
  '@typescript-eslint/strict-boolean-expressions',
  '@typescript-eslint/switch-exhaustiveness-check',
  '@typescript-eslint/use-unknown-in-catch-callback-variable',
  'import-x/no-anonymous-default-export',
  'import-x/no-duplicates',
  'import-x/no-extraneous-dependencies',
  'import-x/no-unassigned-import',
  'import-x/order',
  'json/no-empty-keys',
  'n/prefer-global/process',
  'no-warning-comments',
  'package-json/dependency-version-range',
  'package-json/prefer-files-field',
  'package-json/require-engines',
  'package-json/require-entry-point',
  'perfectionist/sort-jsx-props',
  'react-hooks/set-state-in-effect',
  'react/boolean-prop-naming',
  'react/forward-ref-uses-ref',
  'react/hook-use-state',
  'react/jsx-no-bind',
  'react/jsx-no-leaked-render',
  'react/jsx-no-target-blank',
  'react/jsx-sort-props',
  'react/no-unescaped-entities',
  'react/prefer-read-only-props',
  'react/self-closing-comp',
  'regexp/no-super-linear-move',
  'unicorn/no-break-in-nested-loop',
  'unicorn/prefer-combined-guards',
  'unicorn/prefer-continue',
  'unicorn/prefer-dom-node-html-methods',
  'unicorn/prefer-early-return',
  'unicorn/prefer-iterator-to-array',
  'unicorn/prefer-ternary',

  // Unwanted
  'capitalized-comments',
  'complexity',
  'no-alert',
  'no-console',
  'no-restricted-globals',
  'require-unicode-regexp',
];

export default defineConfig([
  {
    // TODO: Fix issues
    ignores: ['package.json'],
  },
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
            snakeCase: true,
          },
        },
      ],
    },
  },
  {
    // https://github.com/nodejs/node/issues/51292#issuecomment-3151271587
    files: ['**/*.test.ts'],
    rules: { '@typescript-eslint/no-floating-promises': 'off' },
  },
  {
    rules: Object.fromEntries(disabledRules.map(rule => [rule, 'off'])),
  },
  // TODO: Revisit after https://github.com/xojs/eslint-config-xo-react/issues/46
  prettierConflicts,
]);
