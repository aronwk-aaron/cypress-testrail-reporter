const chalk = require('chalk');

export const TestRailLogger = {
    log: (text) => {
        console.log('\n', chalk.magenta.underline.bold('(TestRail Reporter)'));
        console.log('\n', ' - ' + text, '\n');
    },
    warn: (text) => {
        console.log('\n', chalk.magenta.underline.bold('(TestRail Reporter)'));
        console.warn('\n', ' - ' + text, '\n');
    }
}
