const oauthServer = require('oauth2-server');
const Request = oauthServer.Request;
const Response = oauthServer.Response;
const db =  require('../models');
const oauth = require('./oauth');

//const config = require('../config/config');
//const logger = require('../lib/logger').logger;

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

    oauth.authenticate(request, response,options)
      .then(function (token) {
        console.log("then");
        // Request is authorized.
        req.user = token;
        next();
      })
      .catch(function (err) {
          
        console.log("err", err);
        // Request is not authorized.
        res.status(err.code || 500).json(err);
      });
  };
};
