module.exports = {
  root: true,
  parser: '@babel/eslint-parser',
  env: {
    browser: true,
    // es2020: true,
  },
  extends: [
    'eslint:recommended',
    'prettier:recommended',
    'prettier:react',
    'plugin:react/recommended',
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    /*
    'brace-style': ['error', '1tbs'],
    'no-return-assign': 'off',
    'no-var': ['error'],
    'one-var': 'off',
    'jsx-quotes': ['error', 'prefer-single'],
    'multiline-ternary': 'off',
    'space-before-function-paren': ['error', 'never'],
    'no-mixed-operators': 'off',
    eqeqeq: 'off',
    'import/no-absolute-path': 'off',
    'react/prop-types': 'off' // TODO: Enable this
    */
  },
};
