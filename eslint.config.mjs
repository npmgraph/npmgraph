import xo from 'eslint-config-xo';
import xoReact from 'eslint-config-xo-react';
import prettierConflicts from 'eslint-config-prettier';

const xoConfigs = xo({
  browser: true,
}).map(config => {
  if (!config.rules || config.name !== 'xo/base') return config;

  return {
    ...config,
    rules: {
      ...config.rules,
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
    },
  };
});

const xoReactConfigs = xoReact().map(config => ({
  ...config,
  files: ['**/*.{jsx,tsx}'],
}));

const disabledRules = [
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
  '@typescript-eslint/strict-void-return',
  '@typescript-eslint/use-unknown-in-catch-callback-variable',
  'import-x/no-anonymous-default-export',
  'import-x/no-duplicates',
  'import-x/no-extraneous-dependencies',
  'import-x/no-unassigned-import',
  'import-x/order',
  'json/no-empty-keys',
  'no-restricted-globals',
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
  'capitalized-comments',
  'require-unicode-regexp',

  // TODO: After https://github.com/sindresorhus/eslint-plugin-unicorn/pull/2953
  'unicorn/prefer-query-selector',
];

export default [
  ...xoConfigs,
  ...xoReactConfigs,
  {
    rules: {
      ...Object.fromEntries(disabledRules.map(rule => [rule, 'off'])),
      'no-alert': 'off',
      'no-console': 'off',
    },
  },
  prettierConflicts,
];
