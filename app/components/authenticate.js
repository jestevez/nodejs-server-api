const oauthServer = require('oauth2-server');
const Request = oauthServer.Request;
const Response = oauthServer.Response;
const db =  require('../models');
const oauth = require('./oauth');

//const config = require('../config/config');
//const logger = require('../lib/logger').logger;
// https://oauth2-server.readthedocs.io/en/latest/api/oauth2-server.html#authenticate-request-response-options-callback
module.exports = function(options){
  var options = options || {};
  return function(req, res, next) {
    var request = new Request({
      headers: {authorization: req.headers.authorization},
      method: req.method,
      query: req.query,
      body: req.body
    });
    var response = new Response(res);

    oauth.authenticate(request, response, options)
      .then(function (token) {
        // The request was successfully authenticated.

        req.user = token;
        next();
      })
      .catch(function (err) {          
        // The request failed authentication.
        res.status(err.code || 401).json(err);
      });
  };
};
