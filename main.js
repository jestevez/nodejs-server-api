#!/usr/bin/env node
'use strict';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');

const uuid = require('uuid');
const http = require('http');
const https = require('https');
const fs = require('fs');

const config = require('./config/config');
const logger = require('./lib/logger').logger;

const id = uuid.v1();


var expressApp = express();
expressApp.use(express.static(path.join(__dirname, 'public')));
expressApp.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// ENABLE_HTTPS=true LOGGER_LEVEL=debug DEBUG=nodejs-server-api node main.js

const debug = require('debug')('nodejs-server-api');
const name = 'Mi API RESTful ' + id + " __dirname " +__dirname;
debug('booting %s', name);


// setup headers
require('./config/headers')(expressApp);

// express settings
require('./config/express')(expressApp);
require('./config/routes')(expressApp);


// setup http/https base server
var server;
if (config.enableHTTPS) {
    var serverOpts = {};
    serverOpts.key = fs.readFileSync('./etc/test-key.pem');
    serverOpts.cert = fs.readFileSync('./etc/test-cert.pem');
    server = https.createServer(serverOpts, expressApp);
} else {
    server = http.createServer(expressApp);
}

//Start the app by listening on <port>
server.listen(config.port, function () {
    logger.info('api server listening on port %d in %s mode', server.address().port, process.env.NODE_ENV);
});

//expose app
exports = module.exports = expressApp;
