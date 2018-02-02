'use strict';

var pjson = require('../package.json');

var version = pjson.version;

module.exports = {
    apiPrefix: '/saime-ws/v2.0/',
    port: 3000,
    version: version,
    publicPath: process.env.PUBLIC_PATH || false,
    loggerLevel: process.env.LOGGER_LEVEL || 'info',
    enableHTTPS: process.env.ENABLE_HTTPS === 'true',
    db: {
        url: "mongodb://localhost:27017/saime-api-v2"
    }
};
