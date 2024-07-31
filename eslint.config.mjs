import antfu from '@antfu/eslint-config';

export default antfu(
  {
    rules: {
      eqeqeq: 'off',
      'no-alert': 'off',
      'no-console': 'off',
      'antfu/if-newline': 'off',
      'import/order': 'off',
      'style/indent-binary-ops': 'off',
      'ts/consistent-type-definitions': ['error', 'type'],

      // Prettier conflicts
      'style/arrow-parens': 'off',
      'style/brace-style': 'off',
      'style/indent': 'off',
      'style/jsx-one-expression-per-line': 'off',
      'style/member-delimiter-style': 'off',
      'style/multiline-ternary': 'off',
      'style/operator-linebreak': 'off',
      'style/quote-props': 'off',
      'style/quotes': 'off',
      'style/semi': 'off',
      'style/type-generic-spacing': 'off',
    },
  },
  {
    // https://github.com/antfu/eslint-config/issues/570
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'ts/consistent-type-imports': [
        'error',
        { fixStyle: 'inline-type-imports' },
      ],
    },
  },
);
