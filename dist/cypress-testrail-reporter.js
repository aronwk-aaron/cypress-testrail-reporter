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
var moment = require("moment");
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
         * If no suiteId or runId has been passed with previous two methods
         * runner will not be triggered
         */
        if ((_this.suiteId && _this.suiteId.toString().length) || (_this.reporterOptions.planId && _this.reporterOptions.planId.toString().length)) {
            runner.on('start', function () {
                if (_this.reporterOptions.planId) {
                    _this.suiteId = false;
                    testrail_logger_1.TestRailLogger.log("Following planID has been set: " + _this.reporterOptions.planId);
                    if (!_this.plan || (_this.plan && !_this.plan.length)) {
                        testrail_logger_1.TestRailLogger.log("Making the api call to get the plan...");
                        _this.plan = _this.testRailApi.getPlan(_this.reporterOptions.planId);
                    }
                    testrail_logger_1.TestRailLogger.log("Number of suites in the plan: " + _this.plan.length);
                }
                else if (_this.suiteId && _this.suiteId.toString().length) {
                    _this.serverTestCaseIds = _this.testRailApi.getCases(_this.suiteId);
                    /**
                    * runCounter is used to count how many spec files we have during one run
                    * in order to wait for close test run function
                    */
                    testrail_cache_1.TestRailCache.store('runCounter', runCounter);
                    if (!testrail_cache_1.TestRailCache.retrieve('runId')) {
                        /**
                        * creates a new TestRail Run
                        * unless a cached value already exists for an existing TestRail Run in
                        * which case that will be used and no new one created.
                        */
                        if (_this.reporterOptions.suiteId) {
                            testrail_logger_1.TestRailLogger.log("Following suiteId has been set in cypress.json file: " + _this.suiteId);
                        }
                        var executionDateTime = moment().format('MMM Do YYYY, HH:mm (Z)');
                        var name_1 = (_this.reporterOptions.runName || 'Automated test run') + " " + executionDateTime;
                        if (_this.reporterOptions.disableDescription) {
                            var description = '';
                        }
                        else {
                            if (process.env.CYPRESS_CI_JOB_URL) {
                                var description = process.env.CYPRESS_CI_JOB_URL;
                            }
                            else {
                                var description = 'For the Cypress run visit https://dashboard.cypress.io/#/projects/runs';
                            }
                        }
                        testrail_logger_1.TestRailLogger.log("Creating TestRail Run with name: " + name_1);
                        _this.testRailApi.createRun(name_1, description, _this.suiteId);
                    }
                    else {
                        // use the cached TestRail Run ID
                        _this.runId = testrail_cache_1.TestRailCache.retrieve('runId');
                        testrail_logger_1.TestRailLogger.log("Using existing TestRail Run with ID: '" + _this.runId + "'");
                    }
                }
                else {
                    // use the cached TestRail Run ID
                    testrail_logger_1.TestRailLogger.log("Using existing TestRail Plan with ID: '" + _this.reporterOptions.planI + "'");
                }
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
        var _this = this;
        var caseRunId;
        this.plan.forEach(function (entry) {
            if (entry.suite_id == suiteId) {
                entry.runs.forEach(function (testRun) {
                    if (testRun.config.toLowerCase().includes(_this.reporterOptions.runConfig.toLowerCase())) {
                        caseRunId = testRun.id;
                        return;
                    }
                });
            }
            if (caseRunId) {
                return;
            }
        });
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
        if (!this.plan) {
            var invalidCaseIds = caseIds.filter(function (caseId) { return !_this.serverTestCaseIds.includes(caseId); });
            caseIds = caseIds.filter(function (caseId) { return _this.serverTestCaseIds.includes(caseId); });
            if (invalidCaseIds.length > 0)
                testrail_logger_1.TestRailLogger.log("The following test IDs were found in Cypress tests, but not found in Testrail: " + invalidCaseIds);
        }
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
            if (this.plan) {
                caseResults.forEach(function (eachCase) {
                    var suiteId = _this.testRailApi.getSuite(eachCase.case_id);
                    var caseRunId = _this.getRunFromPlan(suiteId);
                    publishedResults_1 = _this.testRailApi.publishResult(eachCase, caseRunId);
                });
            }
            else {
                publishedResults_1 = this.testRailApi.publishResults(caseResults);
                if (publishedResults_1 !== undefined &&
                    this.reporterOptions.allowFailedScreenshotUpload === true &&
                    (status === testrail_interface_1.Status.Failed || status === testrail_interface_1.Status.Retest)) {
                    publishedResults_1.forEach(function (result) {
                        _this.testRailApi.uploadScreenshots(caseIds[0], result.id);
                    });
                }
            }
        }
    };
    return CypressTestRailReporter;
}(mocha_1.reporters.Spec));
exports.CypressTestRailReporter = CypressTestRailReporter;
//# sourceMappingURL=cypress-testrail-reporter.js.map