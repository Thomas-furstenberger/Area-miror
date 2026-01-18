/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // On cherche les fichiers de test dans src/
  roots: ['<rootDir>/src'],
  // On teste les fichiers finissant par .test.ts ou .spec.ts
  testMatch: ['**/*.+(spec|test).ts'],
  // Mock automatique des modules (optionnel mais utile pour Prisma)
  clearMocks: true,
};
