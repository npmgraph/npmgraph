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
  rules: {},
};
