'use strict';

var pjson = require('../package.json');

var version = pjson.version;

module.exports = {
    apiPrefix: process.env.API_PREFIX || '/api/',
    port: process.env.PORT || 3000,
    version: version,
    publicPath: process.env.PUBLIC_PATH || false,
    loggerLevel: process.env.LOGGER_LEVEL || 'info',
    enableHTTPS: process.env.ENABLE_HTTPS === 'true',
    smtpService: process.env.SMTP_SERVICE || 'change',
    smtpHost: process.env.SMTP_HOST || 'change',
    smtpUser: process.env.SMTP_USER || 'change',
    smtpPassword: process.env.SMTP_PASSWORD || 'change',
    db: {
        url: process.env.MONGODB_URL || "mongodb://localhost:27017/sample-db"
    }
};