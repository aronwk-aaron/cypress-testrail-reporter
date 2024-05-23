"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestRailLogger = void 0;
var chalk = require('chalk');
exports.TestRailLogger = {
    log: function (text) {
        console.log('\n', chalk.magenta.underline.bold('(TestRail Reporter)'));
        console.log('\n', ' - ' + text, '\n');
    },
    warn: function (text) {
        console.log('\n', chalk.magenta.underline.bold('(TestRail Reporter)'));
        console.warn('\n', ' - ' + text, '\n');
    }
};
//# sourceMappingURL=testrail.logger.js.map