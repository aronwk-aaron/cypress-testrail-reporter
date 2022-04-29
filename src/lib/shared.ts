/**
 * Search for all applicable test cases
 * @param title
 * @returns {any}
 */
export function casesToCaseIds(cases: string[]): number[] {
  let caseIds: number[] = [];

  let testCaseIdRegExp: RegExp = /\bT?C(\d+)\b/g;
  let m;
  for (let i = 0; i < cases.length; i++) {
      m = testCaseIdRegExp.exec(cases[i])
      let caseId = parseInt(m[1]);
      caseIds.push(caseId);
  }
  return caseIds;
}
