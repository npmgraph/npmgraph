import xo, { jsFilesGlob, tsFilesGlob } from 'eslint-config-xo';
import xoReact from 'eslint-config-xo-react';
import { defineConfig } from 'eslint/config';

const disabledRules = [
  // TODO: Gradually review and enable
  '@typescript-eslint/consistent-type-assertions',
  '@typescript-eslint/no-shadow',
  '@typescript-eslint/no-unsafe-argument',
  '@typescript-eslint/no-unsafe-assignment',
  '@typescript-eslint/no-unsafe-member-access',
  '@typescript-eslint/no-unsafe-type-assertion',
  '@typescript-eslint/prefer-nullish-coalescing',
  '@typescript-eslint/switch-exhaustiveness-check',
  '@typescript-eslint/use-unknown-in-catch-callback-variable',
  'import-x/order',
  'package-json/dependency-version-range',
  'package-json/prefer-files-field',
  'package-json/require-engines',
  'package-json/require-entry-point',
  'react-hooks/set-state-in-effect',
  'react/boolean-prop-naming',
  'react/forward-ref-uses-ref',
  'react/hook-use-state',
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
  'complexity',
  'no-alert',
  'no-console',
  'no-warning-comments',
  'react/jsx-no-target-blank',
  'require-unicode-regexp',
];

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
            snakeCase: true, // TODO: Drop
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
]);
