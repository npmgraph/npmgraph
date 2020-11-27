module.exports = {
  root: true,
  parser: 'babel-eslint',
  env: {
    browser: true,
    es2020: true,
    node: true
  },
  extends: [
    'semistandard'
  ],
  parserOptions: {
    ecmaVersion: 11,
    sourceType: 'module'
  },
  rules: {
    'brace-style': ['error', '1tbs'],
    'no-return-assign': 'off',
    'eol-last': ['error', 'never'],
    'no-var': ['error'],
    'one-var': 'off',
    'space-before-function-paren': ['error', 'never'],
    'no-mixed-operators': 'off',
    eqeqeq: 'off',
    'import/no-absolute-path': 'off'
  }
};