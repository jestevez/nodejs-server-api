const _ = require('lodash');
const mongodb = require('../models/index');
const User = mongodb.User;
const OAuthClient = mongodb.OAuthClient;
const OAuthAccessToken = mongodb.OAuthAccessToken;
const OAuthAuthorizationCode = mongodb.OAuthAuthorizationCode;
const OAuthRefreshToken = mongodb.OAuthRefreshToken;

const logger = require('../../lib/logger').logger;


 


function getAccessToken(bearerToken) {
    logger.debug('getAccessToken %s*****', bearerToken.substring(0, 6) );
    return OAuthAccessToken
        .findOne({access_token: bearerToken})
        .populate('User')
        .populate('OAuthClient')
        .then(function (accessToken) {
    
            if (!accessToken) return false;
    
            var token = accessToken;
            token.user = token.User;
            token.client = token.OAuthClient;
            token.scope = token.scope;
            token.accessTokenExpiresAt  = accessToken.expires;
      
            return token;
    })
    .catch(function (err) {
      logger.error('getAccessToken - Err: %s', err);
    });
}

function getClient(clientId, clientSecret) {
  logger.debug('getClient %s', clientId );
  const options = {client_id: clientId};
  if (clientSecret) options.client_secret = clientSecret;

  return OAuthClient
    .findOne(options)
    .then(function (client) {
      if (!client) return new Error("client not found");
      var clientWithGrants = client;
      clientWithGrants.grants = ['authorization_code', 'password', 'refresh_token', 'client_credentials'];
      // Todo: need to create another table for redirect URIs
      clientWithGrants.redirectUris = [clientWithGrants.redirect_uri];
      delete clientWithGrants.redirect_uri;
      //clientWithGrants.refreshTokenLifetime = integer optional
      //clientWithGrants.accessTokenLifetime  = integer optional
      
      return clientWithGrants;
    }).catch(function (err) {
      logger.error('getClient - Err: %s', err);
    });
}

function getUser(username, password) {
    logger.debug('getUser %s', username);
    
    return User
    .findOne({username: username})
    .then(function (user) {
        // FIXME Cambiar la comprobacion de contraseña
        return user.password === password ? user : false;
    })
    .catch(function (err) {
        logger.error('getUser - Err: %s', err);
    });
}

function revokeAuthorizationCode(code) {
  logger.debug('revokeAuthorizationCode %s', code );
  return OAuthAuthorizationCode.findOne({
    where: {
      authorization_code: code.code
    }
  }).then(function (rCode) {
    //if(rCode) rCode.destroy();
    /***
     * As per the discussion we need set older date
     * revokeToken will expected return a boolean in future version
     * https://github.com/oauthjs/node-oauth2-server/pull/274
     * https://github.com/oauthjs/node-oauth2-server/issues/290
     */
    var expiredCode = code
    expiredCode.expiresAt = new Date('2015-05-28T06:59:53.000Z')
    return expiredCode
  }).catch(function (err) {
     logger.error('revokeAuthorizationCode - Err: %s', err);
  });
}

function revokeToken(token) {
  logger.debug('revokeToken %s', token.refreshToken);
  return OAuthRefreshToken.findOne({
    where: {
      refresh_token: token.refreshToken
    }
  }).then(function (rT) {
    if (rT) rT.destroy();
    /***
     * As per the discussion we need set older date
     * revokeToken will expected return a boolean in future version
     * https://github.com/oauthjs/node-oauth2-server/pull/274
     * https://github.com/oauthjs/node-oauth2-server/issues/290
     */
    var expiredToken = token
    expiredToken.refreshTokenExpiresAt = new Date('2015-05-28T06:59:53.000Z')
    return expiredToken
  }).catch(function (err) {
    logger.error('revokeToken - Err: %s', err);
  });
}

function saveToken(token, client, user) {
  logger.debug('saveToken %s', token.accessToken);
  // FIXME Borrar los token antiguos de los usuarios
  return Promise.all([
      OAuthAccessToken.create({
        access_token: token.accessToken,
        expires: token.accessTokenExpiresAt,
        accessTokenExpiresAt: token.accessTokenExpiresAt, // Server error: `accessTokenExpiresAt` must be a Date instance
        OAuthClient: client._id,
        User: user._id,
        scope: token.scope
      }),
      token.refreshToken ? OAuthRefreshToken.create({ // no refresh token for client_credentials
        refresh_token: token.refreshToken,
        expires: token.refreshTokenExpiresAt,
        accessTokenExpiresAt: token.accessTokenExpiresAt, // Server error: `accessTokenExpiresAt` must be a Date instance
        OAuthClient: client._id,
        User: user._id,
        scope: token.scope
      }) : [],

    ])
    .then(function (resultsArray) {
      return _.assign(  // expected to return client and user, but not returning
        {
          client: client,
          user: user,
          access_token: token.accessToken, // proxy
          refresh_token: token.refreshToken, // proxy
        },
        token
      )
    })
    .catch(function (err) {
      logger.error('saveToken - Err: %s', err);
    });
}

function getAuthorizationCode(code) {
  logger.debug('getAuthorizationCode %s', code);
  return OAuthAuthorizationCode
    .findOne({authorization_code: code})
    .populate('User')
    .populate('OAuthClient')
    .then(function (authCodeModel) {
      if (!authCodeModel) return false;
      var client = authCodeModel.OAuthClient
      var user = authCodeModel.User
      return reCode = {
        code: code,
        client: client,
        expiresAt: authCodeModel.expires,
        redirectUri: client.redirect_uri,
        user: user,
        scope: authCodeModel.scope,
      };
    }).catch(function (err) {
      logger.error('getAuthorizationCode - Err: %s', err);
    });
}

function saveAuthorizationCode(code, client, user) {
  logger.debug('saveAuthorizationCode %s', code);
  return OAuthAuthorizationCode
    .create({
      expires: code.expiresAt,
      OAuthClient: client._id,
      authorization_code: code.authorizationCode,
      User: user._id,
      scope: code.scope
    })
    .then(function () {
      code.code = code.authorizationCode
      return code
    }).catch(function (err) {
      logger.error('saveAuthorizationCode - Err: %s', err);
    });
}

function getUserFromClient(client) {
   logger.debug('getUserFromClient %s', client.client_id);
  var options = {client_id: client.client_id};
  if (client.client_secret) options.client_secret = client.client_secret;

  return OAuthClient
    .findOne(options)
    .populate('User')
    .then(function (client) {
      
      if (!client) return false;
      if (!client.User) return false;
      return client.User;
    }).catch(function (err) {
      logger.error('getUserFromClient - Err: %s', err);
    });
}

function getRefreshToken(refreshToken) {
  logger.debug('getRefreshToken %s', refreshToken);
  if (!refreshToken || refreshToken === 'undefined') return false;
//[OAuthClient, User]
  return OAuthRefreshToken
    .findOne({refresh_token: refreshToken})
    .populate('User')
    .populate('OAuthClient')
    .then(function (savedRT) {

      var tokenTemp = {
        user: savedRT ? savedRT.User : {},
        client: savedRT ? savedRT.OAuthClient : {},
        refreshTokenExpiresAt: savedRT ? new Date(savedRT.expires) : null,
        refreshToken: refreshToken,
        refresh_token: refreshToken,
        scope: savedRT.scope
      };
      return tokenTemp;

    }).catch(function (err) {
      logger.error('getRefreshToken - Err: %s', err);
    });
}

function validateScope(token, client, scope) {
    logger.debug('validateScope %s', scope);
    return (user.scope === client.scope) ? scope : false
}

function verifyScope(token, scope) {
    logger.debug('verifyScope %s', scope);
    return token.scope === scope;
}
module.exports = {
  //generateOAuthAccessToken, optional - used for jwt
  //generateAuthorizationCode, optional
  //generateOAuthRefreshToken, - optional
  getAccessToken: getAccessToken,
  getAuthorizationCode: getAuthorizationCode, //getOAuthAuthorizationCode renamed to,
  getClient: getClient,
  getRefreshToken: getRefreshToken,
  getUser: getUser,
  getUserFromClient: getUserFromClient,
  //grantTypeAllowed, Removed in oauth2-server 3.0
  revokeAuthorizationCode: revokeAuthorizationCode,
  revokeToken: revokeToken,
  saveToken: saveToken,//saveOAuthAccessToken, renamed to
  saveAuthorizationCode: saveAuthorizationCode, //renamed saveOAuthAuthorizationCode,
  //validateScope: validateScope,
  verifyScope: verifyScope,
}

