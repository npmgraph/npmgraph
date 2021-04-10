module.exports = {
  root: true,
  parser: 'babel-eslint',
  env: {
    browser: true
    // es2020: true,
    // node: true
  },
  extends: [
    'eslint:recommended',
    'semistandard',
    'plugin:react/recommended'
  ],
  settings: {
    react: {
      version: 'detect'
    }
  },
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
    'jsx-quotes': ['error', 'prefer-single'],
    'multiline-ternary': 'off',
    'space-before-function-paren': ['error', 'never'],
    'no-mixed-operators': 'off',
    eqeqeq: 'off',
    'import/no-absolute-path': 'off',
    'react/prop-types': 'off' // TODO: Enable this
  }
};