import { reporters } from 'mocha';
import * as moment from 'moment';
import { TestRail } from './testrail';
import { casesToCaseIds } from './shared';
import { Status, TestRailResult } from './testrail.interface';
import { TestRailValidation } from './testrail.validation';
import { TestRailLogger } from './testrail.logger';
import { TestRailCache } from './testrail.cache';
import chalk from 'chalk';
var runCounter = 1;

export class CypressTestRailReporter extends reporters.Spec {
  private results: TestRailResult[] = [];
  private testRailApi: TestRail;
  private testRailValidation: TestRailValidation;
  private runId: number;
  private plan: any;
  private reporterOptions: any;
  private suiteId: any = [];
  private serverTestCaseIds: any = [];
  private cliArguments: any;

  constructor(runner: any, options: any) {
    super(runner);

    this.reporterOptions = options.reporterOptions;

    if (process.env.CYPRESS_TESTRAIL_REPORTER_USERNAME) {
      this.reporterOptions.username = process.env.CYPRESS_TESTRAIL_REPORTER_USERNAME;
    }

    if (process.env.CYPRESS_TESTRAIL_REPORTER_PASSWORD) {
      this.reporterOptions.password = process.env.CYPRESS_TESTRAIL_REPORTER_PASSWORD;
    }

    if (process.env.CYPRESS_TESTRAIL_REPORTER_RUNNAME) {
      this.reporterOptions.runName = process.env.CYPRESS_TESTRAIL_REPORTER_RUNNAME;
    }

    if (process.env.CYPRESS_TESTRAIL_REPORTER_GROUPID) {
      this.reporterOptions.groupId = process.env.CYPRESS_TESTRAIL_REPORTER_GROUPID;
    }
    
    if (process.env.CYPRESS_TESTRAIL_REPORTER_PLANID) {
      this.reporterOptions.planId = process.env.CYPRESS_TESTRAIL_REPORTER_PLANID;
    }

    if (process.env.CYPRESS_TESTRAIL_REPORTER_CLOSE) {
      this.reporterOptions.closeRun = process.env.CYPRESS_TESTRAIL_REPORTER_CLOSE;
    }

    if (process.env.CYPRESS_TESTRAIL_REPORTER_RUNCONFIG) {
      this.reporterOptions.runConfig = process.env.CYPRESS_TESTRAIL_REPORTER_RUNCONFIG;
    }

    if (process.env.CYPRESS_TESTRAIL_REPORTER_SUITEID) {
      this.suiteId = process.env.CYPRESS_TESTRAIL_REPORTER_SUITEID;
    }
    
    this.testRailApi = new TestRail(this.reporterOptions);
    this.testRailValidation = new TestRailValidation(this.reporterOptions);


    /**
     * This will validate reporter options defined in cypress.json file
     * if we are passing suiteId as a part of this file than we assign value to variable
     * usually this is the case for single suite projects
     */
    this.testRailValidation.validateReporterOptions(this.reporterOptions);
    if (this.reporterOptions.suiteId) {
      this.suiteId = this.reporterOptions.suiteId
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
    if (this.reporterOptions.planId && this.reporterOptions.planId.toString().length) {
      runner.on('start', () => {
        this.suiteId = false;
        TestRailLogger.log(`Following planID has been set: ${this.reporterOptions.planId}`);

        if( !this.plan || (this.plan && !this.plan.length) ){
          TestRailLogger.log(`Making the api call to get the plan...`);
          this.plan = this.testRailApi.getPlan(this.reporterOptions.planId)
        }  else {
          // use the cached TestRail Plan
          TestRailLogger.log(`Using existing TestRail Plan with ID: '${this.reporterOptions.planId}'`);   
        }
        TestRailLogger.log(`Number of suites in the plan: ${this.plan.length}`);
      });

      runner.on('pass', test => {
        this.submitResults(Status.Passed, test, `Execution time: ${test.duration}ms`);
      });

      runner.on('fail', (test, err) => {
        this.submitResults(Status.Failed, test, `${err.message}`);
      });

      runner.on('retry', test => {
        this.submitResults(Status.Retest, test, 'Cypress retry logic has been triggered!');
      });

      runner.on('end', () => {
        /**
         * Notify about the results at the end of execution
         */
        TestRailCache.purge();
        if (this.results.length == 0) {
          TestRailLogger.warn('No testcases were matched with TestRail. Ensure that your tests are declared correctly and titles contain matches to format of Cxxxx');
        } else {
          // var path = `runs/view/${this.runId}`;
          // TestRailLogger.log(`Results are published to ${chalk.magenta(`${this.reporterOptions.host}/index.php?/${path}`)}`);
        }
      });
    }
  }

  public getRunFromPlan (suiteId: number): any {
    let caseRunId: number
    this.plan.forEach( entry=> {
      if(entry.suite_id == suiteId) {
        entry.runs.forEach(testRun => {
          if(testRun.config.toLowerCase().includes(this.reporterOptions.runConfig.toLowerCase())) {
            caseRunId = testRun.id;
            return;
          }
        });
      }
      if(caseRunId){
        return;
      }
    });
    return caseRunId;
  }

  /**
   * Ensure that after each test results are reported continuously
   * Additionally to that if test status is failed or retried there is possibility 
   * to upload failed screenshot for easier debugging in TestRail
   * Note: Uploading of screenshot is configurable option
   */
  public submitResults (status, test, comment) {
    if (!test._testConfig.cases){
      return;
    }
    let caseIds = casesToCaseIds(test._testConfig.cases)
    if (caseIds.length) {
      const caseResults: TestRailResult[] = caseIds.map(caseId => {
        return {
          case_id: caseId,
          status_id: status,
          comment: comment,
        };
      });
      TestRailLogger.log(JSON.stringify(caseResults, null, 4))
      this.results.push(...caseResults);
      let publishedResults: any
      caseResults.forEach((eachCase) => {
        let suiteId = this.testRailApi.getSuite(eachCase.case_id)
        let caseRunId: number = this.getRunFromPlan(suiteId)
        publishedResults = this.testRailApi.publishResult(eachCase, caseRunId)
      });
    }
  }
}
