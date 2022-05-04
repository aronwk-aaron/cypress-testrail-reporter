"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CypressTestRailReporter = void 0;
var mocha_1 = require("mocha");
var testrail_1 = require("./testrail");
var shared_1 = require("./shared");
var testrail_interface_1 = require("./testrail.interface");
var testrail_validation_1 = require("./testrail.validation");
var testrail_logger_1 = require("./testrail.logger");
var testrail_cache_1 = require("./testrail.cache");
var runCounter = 1;
var CypressTestRailReporter = /** @class */ (function (_super) {
    __extends(CypressTestRailReporter, _super);
    function CypressTestRailReporter(runner, options) {
        var _this = _super.call(this, runner) || this;
        _this.results = [];
        _this.suiteId = [];
        _this.serverTestCaseIds = [];
        _this.reporterOptions = options.reporterOptions;
        if (process.env.CYPRESS_TESTRAIL_REPORTER_USERNAME) {
            _this.reporterOptions.username = process.env.CYPRESS_TESTRAIL_REPORTER_USERNAME;
        }
        if (process.env.CYPRESS_TESTRAIL_REPORTER_PASSWORD) {
            _this.reporterOptions.password = process.env.CYPRESS_TESTRAIL_REPORTER_PASSWORD;
        }
        if (process.env.CYPRESS_TESTRAIL_REPORTER_RUNNAME) {
            _this.reporterOptions.runName = process.env.CYPRESS_TESTRAIL_REPORTER_RUNNAME;
        }
        if (process.env.CYPRESS_TESTRAIL_REPORTER_GROUPID) {
            _this.reporterOptions.groupId = process.env.CYPRESS_TESTRAIL_REPORTER_GROUPID;
        }
        if (process.env.CYPRESS_TESTRAIL_REPORTER_PLANID) {
            _this.reporterOptions.planId = process.env.CYPRESS_TESTRAIL_REPORTER_PLANID;
        }
        if (process.env.CYPRESS_TESTRAIL_REPORTER_CLOSE) {
            _this.reporterOptions.closeRun = process.env.CYPRESS_TESTRAIL_REPORTER_CLOSE;
        }
        if (process.env.CYPRESS_TESTRAIL_REPORTER_RUNCONFIG) {
            _this.reporterOptions.runConfig = process.env.CYPRESS_TESTRAIL_REPORTER_RUNCONFIG;
        }
        if (process.env.CYPRESS_TESTRAIL_REPORTER_SUITEID) {
            _this.suiteId = process.env.CYPRESS_TESTRAIL_REPORTER_SUITEID;
        }
        _this.testRailApi = new testrail_1.TestRail(_this.reporterOptions);
        _this.testRailValidation = new testrail_validation_1.TestRailValidation(_this.reporterOptions);
        /**
         * This will validate reporter options defined in cypress.json file
         * if we are passing suiteId as a part of this file than we assign value to variable
         * usually this is the case for single suite projects
         */
        _this.testRailValidation.validateReporterOptions(_this.reporterOptions);
        if (_this.reporterOptions.suiteId) {
            _this.suiteId = _this.reporterOptions.suiteId;
        }
        /**
         * This will validate runtime environment variables
         * if we are passing suiteId as a part of runtime env variables we assign that value to variable
         * usually we use this way for multi suite projects
         */
        // this.cliArguments = this.testRailValidation.parseCLIArguments();
        // if (this.cliArguments.testRailSuiteId && this.cliArguments.length) {
        //   this.suiteId = this.cliArguments.testRailSuiteId
        // }
        /**
         * If no planId has been passed then the
         * runner will not be triggered
         */
        if (_this.reporterOptions.planId && _this.reporterOptions.planId.toString().length) {
            runner.on('start', function () {
                _this.suiteId = false;
                testrail_logger_1.TestRailLogger.log("Following planID has been set: " + _this.reporterOptions.planId);
                if (!_this.plan || (_this.plan && !_this.plan.length)) {
                    testrail_logger_1.TestRailLogger.log("Making the api call to get the plan...");
                    _this.plan = _this.testRailApi.getPlan(_this.reporterOptions.planId);
                }
                else {
                    // use the cached TestRail Plan
                    testrail_logger_1.TestRailLogger.log("Using existing TestRail Plan with ID: '" + _this.reporterOptions.planId + "'");
                }
                testrail_logger_1.TestRailLogger.log("Number of suites in the plan: " + _this.plan.length);
            });
            runner.on('pass', function (test) {
                _this.submitResults(testrail_interface_1.Status.Passed, test, "Execution time: " + test.duration + "ms");
            });
            runner.on('fail', function (test, err) {
                _this.submitResults(testrail_interface_1.Status.Failed, test, "" + err.message);
            });
            runner.on('retry', function (test) {
                _this.submitResults(testrail_interface_1.Status.Retest, test, 'Cypress retry logic has been triggered!');
            });
            runner.on('end', function () {
                /**
                 * Notify about the results at the end of execution
                 */
                testrail_cache_1.TestRailCache.purge();
                if (_this.results.length == 0) {
                    testrail_logger_1.TestRailLogger.warn('No testcases were matched with TestRail. Ensure that your tests are declared correctly and titles contain matches to format of Cxxxx');
                }
                else {
                    // var path = `runs/view/${this.runId}`;
                    // TestRailLogger.log(`Results are published to ${chalk.magenta(`${this.reporterOptions.host}/index.php?/${path}`)}`);
                }
            });
        }
        return _this;
    }
    CypressTestRailReporter.prototype.getRunFromPlan = function (suiteId) {
        var caseRunId = 0;
        for (var _i = 0, _a = this.plan.entries(); _i < _a.length; _i++) {
            var _b = _a[_i], x = _b[0], entry = _b[1];
            if (entry.suite_id == suiteId) {
                for (var _c = 0, _d = entry.runs.entries(); _c < _d.length; _c++) {
                    var _e = _d[_c], y = _e[0], testRun = _e[1];
                    if (testRun.config.toLowerCase().includes(this.reporterOptions.runConfig.toLowerCase())) {
                        caseRunId = testRun.id;
                        return caseRunId;
                    }
                }
            }
        }
        return caseRunId;
    };
    /**
     * Ensure that after each test results are reported continuously
     * Additionally to that if test status is failed or retried there is possibility
     * to upload failed screenshot for easier debugging in TestRail
     * Note: Uploading of screenshot is configurable option
     */
    CypressTestRailReporter.prototype.submitResults = function (status, test, comment) {
        var _a;
        var _this = this;
        if (!test._testConfig.cases) {
            return;
        }
        var caseIds = (0, shared_1.casesToCaseIds)(test._testConfig.cases);
        if (caseIds.length) {
            var caseResults = caseIds.map(function (caseId) {
                return {
                    case_id: caseId,
                    status_id: status,
                    comment: comment,
                };
            });
            testrail_logger_1.TestRailLogger.log(JSON.stringify(caseResults, null, 4));
            (_a = this.results).push.apply(_a, caseResults);
            var publishedResults_1;
            caseResults.forEach(function (eachCase) {
                var suiteId = _this.testRailApi.getSuite(eachCase.case_id);
                var caseRunId = _this.getRunFromPlan(suiteId);
                publishedResults_1 = _this.testRailApi.publishResult(eachCase, caseRunId);
            });
        }
    };
    return CypressTestRailReporter;
}(mocha_1.reporters.Spec));
exports.CypressTestRailReporter = CypressTestRailReporter;
//# sourceMappingURL=cypress-testrail-reporter.js.map