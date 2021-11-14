module.exports = {
  root: true,
  parser: '@babel/eslint-parser',
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
  rules: {
    'arrow-parens': ['error', 'as-needed'],
    'brace-style': ['error', '1tbs'],
    eqeqeq: 'off',
    'import/no-absolute-path': 'off',
    'jsx-quotes': ['error', 'prefer-single'],
    'multiline-ternary': 'off',
    'no-mixed-operators': 'off',
    'no-return-assign': 'off',
    'no-var': ['error'],
    'one-var': 'off',
    'react/prop-types': 'off', // TODO: Enable this
    'space-before-function-paren': ['error', 'never'],
  }
};
