const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier/flat');

module.exports = [
  ...expoConfig,
  prettierConfig,
  {
    ignores: [
      'node_modules/**',
      '.expo/**',
      'dist/**',
      'android/**',
      'ios/**',
      'src/types/api.generated.ts',
    ],
  },
  {
    rules: {
      'import/no-unresolved': 'off',
      'import/no-named-as-default-member': 'off',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];
