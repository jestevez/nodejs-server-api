'use strict';


const oauthServer = require('oauth2-server');
const Request = oauthServer.Request;
const Response = oauthServer.Response;

const config = require('./config');
const index = require('../app/controllers/index');
const authenticate = require('../app/components/authenticate');
const oauth = require('../app/components/oauth');

const db =  require('../app/models');

module.exports = function (app, router) {

    var apiPrefix = config.apiPrefix;

    // Version
    router.route('/version').get(index.version);

    
    // Home
    router.get('/', function(req, res, next) {
        res.render('index', { title: 'Api '+index.version });
    });
    
    router.get('/me', authenticate(), function(req,res){
        res.json({
          me: req.user,
          messsage: 'Authorization success, Without Scopes, Try accessing /profile with `profile` scope',
          description: 'Try postman https://www.getpostman.com/collections/37afd82600127fbeef28',
          more: 'pass `profile` scope while Authorize'
        })
    });

    router.get('/profile', authenticate({scope:'profile'}), function(req,res){
        res.json({
          profile: req.user
        })
    });

    router.all('/oauth/token', function(req,res,next){
      var request = new Request(req);
      var response = new Response(res);

      oauth
        .token(request,response)
        .then(function(token) {
          // Todo: remove unnecessary values in response
          return res.json(token)
        }).catch(function(err){
          return res.status(500).json(err)
        })
    });

    router.post('/authorise', function(req, res){
      var request = new Request(req);
      var response = new Response(res);

      return oauth.authorize(request, response).then(function(success) {
        //  if (req.body.allow !== 'true') return callback(null, false);
        //  return callback(null, true, req.user);
          res.json(success)
      }).catch(function(err){
        res.status(err.code || 500).json(err)
      })
    });

    router.get('/authorise', function(req, res) {
      return db.OAuthClient.findOne({
          where: {
            client_id: req.query.client_id,
            redirect_uri: req.query.redirect_uri,
          },
          attributes: ['id', 'name'],
        })
        .then(function(model) {
          if (!model) return res.status(404).json({ error: 'Invalid Client' });
          return res.json(model);
        }).catch(function(err){
          return res.status(err.code || 500).json(err)
        });
    });
    
    
    // Secure
    router.get('/secure', authenticate(), function(req,res){
        res.json({message: 'Secure data'});
    });
    
    

    // Dummy
    router.get('/test', function (req, res) {
        var data = {
            name: 'Jose Luis Estevez',
            website: 'http://joseluisestevez.com'
        };
        res.json(data);
    });


    router.post('/post', function (req, res) {

        if (req.body.Id && req.body.Title && req.body.Director &&
                req.body.Year && req.body.Rating) {

            res.status(200).json({Id: req.body.Id})
            
        } else {
            res.status(500).json({error: 'There was an error!'});
        }

    });
    
    // Register all our routes
    app.use(apiPrefix, router);
};


