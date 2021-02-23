module.exports = {
    injectGlobals: false,
    preset: 'ts-jest',
    rootDir: '.',
    testEnvironment: 'node',
    transformIgnorePatterns: [
        "node_modules/(?!@ams)"
    ]
};
