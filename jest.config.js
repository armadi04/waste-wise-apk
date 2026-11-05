module.exports = {
  preset: 'jest-expo',
  testMatch: ['<rootDir>/__tests__/ui/**/*.ui.tsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
