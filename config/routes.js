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

const apiPrefix = config.apiPrefix;

const express = require('express');
const router = express.Router();

module.exports = function (app) {

    // Validar si un correo ya esta en uso dentro de la aplicación
    router.route('/email').post(oneOf([
            [ check('email').exists(),                
            , check('email').isEmail().withMessage('must be an email').trim().normalizeEmail()
            ]]), UserController.checkEmail);
        
    // Modificar datos del usuario
    router.put('/users', UserController.putUsers);
    
    // Dar de alta un nuevo usuario
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

    // Validar token de verificación
    router.get('/verify/:token', UserController.getVerify);
    
    // Veriificar correo de alta de usuario
    router.post('/verify/:token', UserController.postVerify);
    
    // Si el token de alta expiro solicitar uno nuevo
    router.put('/verify', UserController.putVerify);
    
    // Recuperar contraseña
    router.route('/forgot').post(oneOf([
            [ check('email').exists(),                
            , check('email').isEmail().withMessage('must be an email').trim().normalizeEmail()
            ]]), UserController.forgot);    
    
    // Verificar token de olvido de contraseña
    router.get('/reset/:token', UserController.getReset);
    
    // Cambiar contraseña con token de olvido de contraseña
    router.post('/reset/:token', UserController.postReset);
    
    // Version
    router.route('/version').get(index.version);

    // me
    router.route('/me').get(authenticate(), UserController.me);
    

    router.get('/profile', authenticate({scope:'profile'}), function(req,res){
        res.json({
          profile: req.user
        });
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
    
    router.post('/authorise', function(req, res){
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
    
    
    // Register all our routes
    app.use(apiPrefix, router);
    
    
    
    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
      var err = new Error('Not Found');
      res.status(404);
        res.send({
            message: err.message,
            error:  'Not Found'
        });
    });

    // error handlers
    // NODE_ENV=development node app.js
    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
      app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.send({
            message: err.message,
            error: err
        });
      });
    }

    // production error handler
    // no stacktraces leaked to user
    app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.send({
        message: err.message,
        error: err
        });
    });

    
};

