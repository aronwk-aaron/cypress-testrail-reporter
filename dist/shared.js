"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.casesToCaseIds = void 0;
/**
 * Search for all applicable test cases
 * @param title
 * @returns {any}
 */
function casesToCaseIds(cases) {
    var caseIds = [];
    var testCaseIdRegExp = /\bT?C(\d+)\b/g;
    var m;
    for (var i = 0; i < cases.length; i++) {
        m = testCaseIdRegExp.exec(cases[i]);
        var caseId = parseInt(m[1]);
        caseIds.push(caseId);
    }
    return caseIds;
}
exports.casesToCaseIds = casesToCaseIds;
//# sourceMappingURL=shared.js.map