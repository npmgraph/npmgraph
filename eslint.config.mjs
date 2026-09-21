import prettierConflicts from 'eslint-config-prettier';
import xo, { jsFilesGlob, tsFilesGlob } from 'eslint-config-xo';
import xoReact from 'eslint-config-xo-react';
import { defineConfig } from 'eslint/config';

const disabledRules = [
  '@html-eslint/attrs-newline',
  '@html-eslint/no-extra-spacing-tags',
  '@html-eslint/require-closing-tags',
  '@stylistic/curly-newline',
  '@stylistic/padding-line-between-statements',
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
  'complexity',
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

  // TODO: Enable this after https://github.com/sindresorhus/eslint-plugin-unicorn/pull/2953
  'unicorn/prefer-query-selector',

  'unicorn/no-break-in-nested-loop',
  'unicorn/prefer-dom-node-html-methods',
  'unicorn/prefer-iterator-to-array',

  // Unwanted
  'capitalized-comments',
  'no-alert',
  'no-console',
  'no-restricted-globals',
  'prefer-ternary',
  'require-unicode-regexp',
];

export default defineConfig([
  {
    // TODO: Use gitignore when upgrading to eslint-config-xo@4+
    ignores: [
      'node_modules',
      'dist',
      'package.json',
      'package-lock.json',
      'index.html',
    ],
  },
  ...xo({ browser: true, space: true }),
  ...xoReact(),
  {
    files: [tsFilesGlob, jsFilesGlob],
    rules: {
      'unicorn/switch-case-braces': ['error', 'avoid'],
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
      ...Object.fromEntries(disabledRules.map(rule => [rule, 'off'])),
    },
  },
  {
    // node:test's `describe`/`it` return promises that don't need awaiting
    files: ['**/*.test.ts'],
    rules: { '@typescript-eslint/no-floating-promises': 'off' },
  },
  // TODO: Use `prettier:compat` when upgrading to eslint-config-xo@4+
  prettierConflicts,
]);
