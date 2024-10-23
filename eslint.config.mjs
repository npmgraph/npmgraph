import antfu from '@antfu/eslint-config';

export default antfu({
  react: {
    version: 'detect',
  },
  rules: {
    'no-alert': 'off',
    'no-console': 'off',
    'antfu/if-newline': 'off',
    'style/indent-binary-ops': 'off',
    'ts/consistent-type-definitions': ['error', 'type'],
    'perfectionist/sort-imports': 'off',
    'perfectionist/sort-named-imports': 'off',

    // Prettier conflicts
    // TODO: Update after https://github.com/antfu/eslint-config/issues/615
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
  typescript: {
    overrides: {
      // https://github.com/antfu/eslint-config/issues/570
      'ts/consistent-type-imports': [
        'error',
        { fixStyle: 'inline-type-imports' },
      ],
    },
  },
});
