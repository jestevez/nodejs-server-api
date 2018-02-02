'use strict';


const oauthServer = require('oauth2-server');
const Request = oauthServer.Request;
const Response = oauthServer.Response;

const config = require('./config');
const index = require('../app/controllers/index');
const UserController = require('../app/controllers/UserController');
const authenticate = require('../app/components/authenticate');
const oauth = require('../app/components/oauth');

const db =  require('../app/models');

const { check, oneOf, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');

function isValidDate(value) {
  if (!value.match(/^\d{4}-\d{2}-\d{2}$/)) return false;
  const date = new Date(value);
  if (!date.getTime()) return false;
  return date.toISOString().slice(0, 10) === value;
}

module.exports = function (app, router) {

    var apiPrefix = config.apiPrefix;

    // Endpoint API SAIME V2
    router.route('/users')
        .post(oneOf([
            [
                check('username').exists(),
                check('password').exists(),
                check('idpersona').exists(),
                check('cedula').exists(),
                check('letra').exists(),
                check('emailalternativo').exists(),
                check('primernombre').exists(),
                check('primerapellido').exists(),
                check('segundonombre').exists(),
                check('segundoapellido').exists(),
                check('sexo').exists(),
                check('fechanacimiento').exists(),
                check('telefono').exists(),
                check('cedulado').exists(),
                check('idpais').exists(),
                check('nacionalidad').exists(),
                check('callcenter').exists(),
                check('estadocivil').exists()
                
                , check('username').isEmail().withMessage('must be an email').trim().normalizeEmail()
                , check('password', 'passwords must be at least 5 chars long').isLength({ min: 5 })
                , check('password', 'contain one number').matches(/\d/)
                , check('fechanacimiento').custom(isValidDate).withMessage('the date must be valid')
                , check('sexo', 'sexo invalid length').isLength({ max: 1 })
                , check('letra', 'letra invalid length').isLength({ max: 1 })
            ]
            
            
          ]), UserController.postUsers);


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
            // The resource owner granted the access request.
    
            // Remove unnecessary values in response
            delete token.client;
            delete token.user;
            
            return res.json(token);
        }).catch(function(err){
            // The request was invalid or not authorized.
            return res.status(500).json(err);
        })
    });

    const AccessDeniedError = require('oauth2-server/lib/errors/access-denied-error');
    
    router.post('/authorize', function(req, res){
      var request = new Request(req);
      var response = new Response(res);
      
      return oauth.authorize(request, response).then(function(success) {
        //  if (req.body.allow !== 'true') return callback(null, false);
        //  return callback(null, true, req.user);
          res.json(success);
      }).catch(function(err){
          if (err instanceof AccessDeniedError) {
            // The resource owner denied the access request.
            res.status(err.code || 401).json(err);
          } else {
            // Access was not granted due to some other error condition.
            res.status(err.code || 500).json(err);
          }
        
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
        res.json({message: 'Ya tienes el BearerToken! '});
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


