const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
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
