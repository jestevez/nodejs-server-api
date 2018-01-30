const oauthServer = require('oauth2-server');

const config = require(__dirname +'/../../config/config');
const logger = require(__dirname +'/../../lib/logger').logger;

const oauth = new oauthServer({
  model: require(__dirname +'/mongo-models.js')
});

module.exports = oauth;