import antfu from '@antfu/eslint-config';
import prettierConflicts from 'eslint-config-prettier';

export default antfu(
  {
    react: {
      version: 'detect',
    },
    rules: {
      'no-alert': 'off',
      'no-console': 'off',
      'antfu/if-newline': 'off',
      'antfu/consistent-chaining': 'off',
      'test/no-import-node-test': 'off',
      'ts/consistent-type-definitions': ['error', 'type'],
      'perfectionist/sort-imports': 'off',
      'perfectionist/sort-named-imports': 'off',
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
  },
  prettierConflicts,
);
