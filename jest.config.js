const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFiles: ['<rootDir>/.jest/setEnvVars.js'],
  testEnvironment: 'jest-environment-node',
  testMatch: ['**/__tests__/**/*.test.ts'],
}

module.exports = createJestConfig(customJestConfig)