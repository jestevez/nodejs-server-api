const OAuth2Server = require('oauth2-server');

const config = require(__dirname +'/../../config/config');
const logger = require(__dirname +'/../../lib/logger').logger;



const oauth = new OAuth2Server({
  model: require(__dirname +'/mongo-models.js'),
  allowBearerTokensInQueryString: false,           // Allow clients to pass bearer tokens in the query string of a request.
  addAcceptedScopesHeader: true,                   // Set the X-Accepted-OAuth-Scopes HTTP header on response objects.
  addAuthorizedScopesHeader: true,                 // Set the X-OAuth-Scopes HTTP header on response objects.
  accessTokenLifetime: 4 * 60 * 60,                // Lifetime of generated access tokens in seconds (default = 1 hour).
  refreshTokenLifetime: 3600,                      // Lifetime of generated refresh tokens in seconds (default = 2 weeks).
  requireClientAuthentication: {password: false}
});

module.exports = oauth;