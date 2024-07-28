import antfu from '@antfu/eslint-config';

export default antfu({
  rules: {
    eqeqeq: 'off',
    'no-alert': 'off',
    'no-console': 'off',
    'antfu/if-newline': 'off',
    'import/order': 'off',
    'style/arrow-parens': 'off',
    'style/brace-style': 'off',
    'style/indent-binary-ops': 'off',
    'style/indent': 'off',
    'style/jsx-one-expression-per-line': 'off',
    'style/member-delimiter-style': 'off',
    'style/multiline-ternary': 'off',
    'style/operator-linebreak': 'off',
    'style/quote-props': 'off',
    'style/quotes': 'off',
    'style/semi': 'off',
    'style/type-generic-spacing': 'off',
    'ts/consistent-type-imports': 'off',
    'ts/consistent-type-definitions': ['error', 'type'],
  },
});
