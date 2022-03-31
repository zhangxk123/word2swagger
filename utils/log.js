const chalk = require('chalk');
const error = chalk.bold.red;
const warning = chalk.hex('#FFA500');
const success = chalk.green;
module.exports = {
    logError:error,
    logWarning:warning,
    logSuccess:success
}
