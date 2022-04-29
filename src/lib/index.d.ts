/// <reference types="cypress" />

declare namespace Cypress {
    // specify additional properties in the TestConfig object
    // in our case we will add "cases" property
    interface TestConfigOverrides {
      /**
       * List of cases for this test
       * @example a single tag
       *  it('logs in', { cases: '@smoke' }, () => { ... })
       * @example multiple cases
       *  it('works', { cases: ['@smoke', '@slow'] }, () => { ... })
       */
      cases?: string[]
    }
  }