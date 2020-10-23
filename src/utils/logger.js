const appRoot = require('app-root-path');
const winston = require('winston');
const { format } = require('winston');
// const Transport = require('winston-transport');

console.log(`${appRoot.path}/logs/info.log`);
const options = {
  file: {
    level: 'info',
    name: 'info',
    filename: `${appRoot.path}/logs/info.log`,
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 100,
    colorize: true,
    timestamp: true
  },
  errorFile: {
    level: 'error',
    name: 'errors',
    filename: `${appRoot.path}/logs/errors.log`,
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 100,
    colorize: true,
    timestamp: true
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    json: true,
    colorize: true
  }
};

let transports = [];
transports = [
  new (winston.transports.File)(options.errorFile),
  new (winston.transports.File)(options.file)
];

module.exports = winston.createLogger({
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports,
  exitOnError: false
});
