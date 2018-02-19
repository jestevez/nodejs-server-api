'use strict';

const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const validator = require('express-validator');
const session = require('express-session');

const config = require('./config');
const logger = require('../lib/logger').logger;


function logErrors(err, req, res, next) {
  console.error(err.stack);
  next(err);
}
function clientErrorHandler(err, req, res, next) {
  if (req.xhr) {
    res.status(500).send({ error: 'Something failed!' });
  } else {
    next(err);
  }
}
function errorHandler(err, req, res, next) {
  res.status(500);
  res.render('error', { error: err });
}

module.exports = function (app) {
    app.use(morgan('common'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(validator());
    app.use(session({ secret: 'Giyaebei3xeev3gep5sooceiDu2neithaichohTu' }));
    
//    app.set('showStackError', true);
//    app.set('json spaces', 0);
//    app.enable('jsonp callback');
//    app.use(logErrors);
//    app.use(clientErrorHandler);
//    app.use(errorHandler);

};
