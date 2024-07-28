import antfu from '@antfu/eslint-config'

export default antfu({
  rules: {
    'eqeqeq': 'off',
    'no-alert': 'off',
    'no-console': 'off',
    'style/semi': 'off',
  },
});
