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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CypressTestRailReporter = void 0;
var mocha_1 = require("mocha");
var testrail_1 = require("./testrail");
var shared_1 = require("./shared");
var testrail_interface_1 = require("./testrail.interface");
var testrail_validation_1 = require("./testrail.validation");
var testrail_logger_1 = require("./testrail.logger");
var testrail_cache_1 = require("./testrail.cache");
var chalk_1 = require("chalk");
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
        return _this;
        /**
         * This will validate runtime environment variables
         * if we are passing suiteId as a part of runtime env variables we assign that value to variable
         * usually we use this way for multi suite projects
         */
        // this.cliArguments = this.testRailValidation.parseCLIArguments();
        // if (this.cliArguments.testRailSuiteId && this.cliArguments.length) {
        //   this.suiteId = this.cliArguments.testRailSuiteId
        // }
    }
    CypressTestRailReporter.initializer = function (runner, options) {
        return __awaiter(this, void 0, void 0, function () {
            var myReporter;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        myReporter = new CypressTestRailReporter(runner, options);
                        return [4 /*yield*/, myReporter.setupListeners()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, myReporter];
                }
            });
        });
    };
    CypressTestRailReporter.prototype.setupListeners = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.reporterOptions.planId && this.reporterOptions.planId.toString().length)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.runner.on('start', function () { return __awaiter(_this, void 0, void 0, function () {
                                var _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            this.suiteId = false;
                                            testrail_logger_1.TestRailLogger.log("Following planID has been set: " + this.reporterOptions.planId);
                                            if (!(!this.plan || (this.plan && !this.plan.entries.length))) return [3 /*break*/, 2];
                                            console.log(" - Making the api call to get the plan...");
                                            _a = this;
                                            return [4 /*yield*/, this.testRailApi.getPlan(this.reporterOptions.planId)];
                                        case 1:
                                            _a.plan = _b.sent();
                                            return [3 /*break*/, 3];
                                        case 2:
                                            // use the cached TestRail Plan
                                            console.log(" - Using existing TestRail Plan with ID: '" + this.reporterOptions.planId + "'");
                                            _b.label = 3;
                                        case 3:
                                            console.log(" - Number of suites in the plan: " + this.plan.entries.length);
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.runner.on('pass', function (test) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.submitResults(testrail_interface_1.Status.Passed, test, "Execution time: " + test.duration + "ms")];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.runner.on('fail', function (test, err) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.submitResults(testrail_interface_1.Status.Failed, test, "" + err.message)];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.runner.on('retry', function (test) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.submitResults(testrail_interface_1.Status.Retest, test, 'Cypress retry logic has been triggered!')];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.runner.on('end', function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            /**
                                             * Notify about the results at the end of execution
                                             */
                                            testrail_cache_1.TestRailCache.purge();
                                            if (this.results.length == 0) {
                                                console.warn(' - [TestRail] No testcases were matched with TestRail. Ensure that your tests are declared correctly and titles contain matches to format of Cxxxx');
                                            }
                                            else {
                                                // var path = `runs/view/${this.runId}`;
                                                // TestRailLogger.log(`Results are published to ${chalk.magenta(`${this.reporterOptions.host}/index.php?/${path}`)}`);
                                            }
                                            console.log(" - Starting last call to this.testRailapi.getPlan");
                                            return [4 /*yield*/, this.testRailApi.getPlan(this.reporterOptions.planId)];
                                        case 1:
                                            _a.sent();
                                            console.log(" - Finished last call to this.testRailapi.getPlan");
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    CypressTestRailReporter.prototype.getRunFromPlan = function (suiteId) {
        var caseRunId;
        for (var _i = 0, _a = Object.entries(this.plan.entries); _i < _a.length; _i++) {
            var _b = _a[_i], x = _b[0], entry = _b[1];
            if (entry.suite_id == suiteId) {
                for (var _c = 0, _d = Object.entries(entry.runs); _c < _d.length; _c++) {
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
        return __awaiter(this, void 0, void 0, function () {
            var caseIds, caseResults, publishedResults, _i, _a, _b, x, eachCase, suiteId, caseRunId;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!test._testConfig.cases) {
                            return [2 /*return*/];
                        }
                        caseIds = (0, shared_1.casesToCaseIds)(test._testConfig.cases);
                        if (!caseIds.length) return [3 /*break*/, 6];
                        caseResults = caseIds.map(function (caseId) {
                            return {
                                case_id: caseId,
                                status_id: status,
                                comment: comment,
                            };
                        });
                        (_c = this.results).push.apply(_c, caseResults);
                        publishedResults = void 0;
                        _i = 0, _a = Object.entries(caseResults);
                        _d.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        _b = _a[_i], x = _b[0], eachCase = _b[1];
                        return [4 /*yield*/, this.testRailApi.getSuite(eachCase.case_id)];
                    case 2:
                        suiteId = _d.sent();
                        return [4 /*yield*/, this.getRunFromPlan(suiteId)];
                    case 3:
                        caseRunId = _d.sent();
                        if (caseRunId == undefined) {
                            console.log(' - ', chalk_1.default.magenta.underline.bold('[TestRail]'), " No runs for config: " + this.reporterOptions.runConfig.toLowerCase());
                            return [3 /*break*/, 5];
                        }
                        return [4 /*yield*/, this.testRailApi.publishResult(eachCase, caseRunId)];
                    case 4:
                        publishedResults = _d.sent();
                        if (publishedResults.status == 200) {
                            console.log(' - ', chalk_1.default.magenta.underline.bold('[TestRail]'), 'result published');
                        }
                        _d.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return CypressTestRailReporter;
}(mocha_1.reporters.Spec));
exports.CypressTestRailReporter = CypressTestRailReporter;
//# sourceMappingURL=cypress-testrail-reporter.js.map