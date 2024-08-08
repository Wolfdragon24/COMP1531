module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    maxWorkers: 1,
    transform: {
        "^.+\\.[t|j]sx?$": "babel-jest"
    }
};  