module.exports = {
    testEnvironment: 'node',

    // Load test environment variables
    setupFiles: ['dotenv/config'],

    // Where to find tests (2 areas: modules + root)
    roots: [
        '<rootDir>/src',
        '<rootDir>/tests'
    ],

    // Test file detection pattern
    testMatch: [
        '**/__tests__/**/*.test.js',
        '**/tests/**/*.test.js'
    ],

    // Files to ignore
    testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
        '/public/'
    ],

    // Global timeout (30 seconds for integration tests)
    testTimeout: 30000,

    // Verbose to see the detail of each test
    verbose: true,

    // Code coverage
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/config/**',
        '!src/crons/**',
        '!src/shared/snippets/**',
        '!src/shared/lib/swagger/**',
        '!src/**/resources/**',
        '!src/**/enums/**',
        '!src/routes/route.parent.js',
        '!src/bin/**'
    ],

    coverageDirectory: 'coverage',

    coverageReporters: ['text', 'lcov', 'clover'],

    // Projects to run by type
    projects: [{
            displayName: 'unit',
            testEnvironment: 'node',
            testMatch: ['**/__tests__/unit/**/*.unit.test.js'],
        },
        {
            displayName: 'integration',
            testEnvironment: 'node',
            testMatch: ['**/__tests__/integration/**/*.integration.test.js'],
            globalSetup: './tests/setup/jest.setup.js',
            globalTeardown: './tests/setup/jest.teardown.js',
        },
        {
            displayName: 'e2e',
            testEnvironment: 'node',
            testMatch: ['**/tests/e2e/**/*.e2e.test.js'],
            globalSetup: './tests/setup/jest.setup.js',
            globalTeardown: './tests/setup/jest.teardown.js',
        }
    ],

    // Force exit after tests
    forceExit: true,

    // Detect handle leaks
    detectOpenHandles: true,
};