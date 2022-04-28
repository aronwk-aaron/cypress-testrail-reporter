/// <reference types="cypress" />

declare namespace Cypress {
    // specify additional properties in the TestConfig object
    // in our case we will add "cases" property
    interface TestConfigOverrides {
      /**
       * List of cases for this test
       * @example a single case
       *  it('logs in', { cases: 'CXXXXXX' }, () => { ... })
       * @example multiple cases
       *  it('works', { cases: ['CXXXXXX', 'CXXXXXX'] }, () => { ... })
       */
      cases?: string | string[]
    }
  }