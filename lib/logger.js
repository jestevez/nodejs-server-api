const winston = require('winston');
const config = require('../config/config');

var logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      level: 'error'
    }),
  ]
});
logger.transports.console.level = config.loggerLevel;

module.exports.logger = logger;

//winston.level = config.loggerLevel;
winston.log('info', 'WISTON is config!', {
  level: config.loggerLevel
});


