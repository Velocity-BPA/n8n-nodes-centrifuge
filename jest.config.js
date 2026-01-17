/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/test'],
	testMatch: ['**/*.test.ts'],
	moduleFileExtensions: ['ts', 'js', 'json'],
	collectCoverageFrom: [
		'nodes/**/*.ts',
		'credentials/**/*.ts',
		'!**/*.d.ts',
		'!**/index.ts',
	],
	coverageDirectory: 'coverage',
	coverageReporters: ['text', 'lcov', 'html'],
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/$1',
	},
	testTimeout: 30000,
	verbose: true,
	globals: {
		'ts-jest': {
			tsconfig: {
				module: 'commonjs',
				target: 'es2022',
				esModuleInterop: true,
				allowSyntheticDefaultImports: true,
				strict: true,
				skipLibCheck: true,
				types: ['jest', 'node'],
			},
		},
	},
};
