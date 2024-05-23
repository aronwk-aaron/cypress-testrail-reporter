module.exports = async (runner, options) => {
    return await require('./dist/cypress-testrail-reporter').CypressTestRailReporter.initializer(runner, options);
}
