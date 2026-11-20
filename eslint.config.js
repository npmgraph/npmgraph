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

// To change rule settings or disable rules, add a plain rule entry to an
// existing object in this config (disabledRules or the tsFilesGlob block).
// Never add new config objects, never import from xo and never reach into
// xo's config objects.
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
  'unicorn/prefer-await',
  'unicorn/prefer-iterator-to-array', // TODO: 2027

  // Unwanted
  '@stylistic/no-mixed-operators', // Should be part of prettier:compat but it's not?
  '@typescript-eslint/naming-convention', // I don't see this happening
  '@typescript-eslint/no-empty-function', // No reason to enforce this
  'import-x/order', // Handled by prettier-plugin-sort-imports
  '@typescript-eslint/no-restricted-types', // null ok
  '@typescript-eslint/strict-boolean-expressions', // Too strict
  'capitalized-comments',
  'no-alert',
  'no-console',
  'no-warning-comments',
  'react-doctor/jsx-no-target-blank',
  'react-doctor/no-hydration-branch-on-browser-global', // No server render
  'react-doctor/no-unguarded-browser-global-at-module-scope', // No server render
  'react-doctor/no-unguarded-browser-global-in-render-or-hook-init', // No server render
  'react-doctor/rendering-hydration-mismatch-time', // No server render
  'react/jsx-no-target-blank',
  'require-unicode-regexp',
  'unicorn/no-null', // null ok
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
      'unicorn/no-manually-wrapped-comments': 'error',
      'unicorn/switch-case-braces': ['error', 'avoid'],
      'unicorn/prefer-query-selector': ['error', { allowWithVariables: true }],
      'unicorn/name-replacements': [
        'error',
        {
          // TODO: Remove most exceptions
          replacements: {
            props: false,
            ref: false,
            refs: false,
            pkg: false,
            param: false,
            fn: false,
            ev: false,
            args: false,
            arg: false,
            i: false,
            deps: false,
            dep: false,
            src: false,
            repo: false,
            doc: false,
            ctx: false,
            buf: false,
            util: false,
            dev: false,
            dist: false,
          },
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

      'byo/no-inline-style': [
        'error',
        {
          selector:
            'JSXAttribute[name.name="style"] > JSXExpressionContainer > ObjectExpression > Property:matches([value.type="Literal"], [value.type="TemplateLiteral"][value.expressions.length=0], [value.type="UnaryExpression"][value.argument.type="Literal"])',
          message:
            'Move static styles to a CSS module; `style` is only for values computed at runtime',
        },
      ],

      'byo/no-template-class-name': [
        'error',
        {
          selector:
            'JSXAttribute[name.name="className"] > JSXExpressionContainer > TemplateLiteral',
          message: 'Use cn() from lib/dom.ts instead of a template literal',
        },
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
  {
    files: [tsFilesGlob, jsFilesGlob, '**/*.css'],
    rules: {
      // https://github.com/sindresorhus/eslint-plugin-unicorn/issues/4027#issuecomment-7003173556
      'unicorn/single-line-block-comment-style': ['error', 'single-line'],

      'unicorn/filename-case': [
        'error',
        { cases: { kebabCase: true, camelCase: true, pascalCase: true } },
      ],
    },
  },
]);
