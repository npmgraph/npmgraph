import css from '@eslint/css';
import xo, { jsFilesGlob, tsFilesGlob } from 'eslint-config-xo';
import xoReact from 'eslint-config-xo-react';
import byo from 'eslint-plugin-byo';
import reactDoctor from 'eslint-plugin-react-doctor';
import reactYouMightNotNeedAnEffect from 'eslint-plugin-react-you-might-not-need-an-effect';
import { defineConfig } from 'eslint/config';
import selectDom from 'select-dom/eslint-plugin';
import noMagicColors from './eslint-rules/no-magic-colors.js';
import noUnnecessaryScss from './eslint-rules/no-unnecessary-scss.js';

const local = {
  rules: {
    'no-magic-colors': noMagicColors,
    'no-unnecessary-scss': noUnnecessaryScss,
  },
};

const disabledRules = [
  // TODO: Gradually review and enable
  '@typescript-eslint/consistent-type-assertions',
  '@typescript-eslint/no-unsafe-argument',
  '@typescript-eslint/no-unsafe-assignment',
  '@typescript-eslint/no-unsafe-member-access',
  '@typescript-eslint/use-unknown-in-catch-callback-variable',
  'package-json/prefer-files-field',
  'package-json/require-engines',
  'package-json/require-entry-point',
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

export default defineConfig([
  // Don't add new objects to this list unless strictly necessary. Extend the existing ones instead
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
    plugins: { byo },
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

      'import-x/order': [
        'error',
        {
          warnOnUnassignedImports: 'top',
          'newlines-between': 'never',
        },
      ],

      'byo/no-direct-location-hash': [
        'error',
        {
          selector:
            'MemberExpression[property.name="hash"]:matches([object.name="location"], [object.object.name=/^(window|globalThis)$/][object.property.name="location"])',
          message:
            'Use useHashParameters() or patchHash() instead of location.hash',
        },
      ],
    },
  },
  {
    files: [tsFilesGlob],
    rules: {
      '@typescript-eslint/prefer-nullish-coalescing': [
        'error',
        { ignorePrimitives: { boolean: true } },
      ],
    },
  },
  reactDoctor.configs.recommended,
  {
    // Warnings are ignored, so make them fail
    rules: Object.fromEntries(
      Object.keys(reactDoctor.configs.recommended.rules).map(rule => [
        rule,
        'error',
      ]),
    ),
  },
  reactYouMightNotNeedAnEffect.configs.strict,
  {
    plugins: { 'select-dom': selectDom },
    rules: { 'select-dom/prefer': 'error' },
  },
  {
    files: ['**/*.css', '**/*.scss'],
    plugins: { css, local },
    language: 'css/css',
    languageOptions: { tolerant: true },
    rules: {
      'local/no-unnecessary-scss': 'error',
      'local/no-magic-colors': 'error',
    },
  },
  {
    rules: Object.fromEntries(disabledRules.map(rule => [rule, 'off'])),
  },
]);
