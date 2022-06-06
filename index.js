module.exports = async (runner, options) => {
    await require('./dist/cypress-testrail-reporter').CypressTestRailReporter.initializer(runner, options);
}
