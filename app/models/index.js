
const mongoose = require('mongoose');

const config = require(__dirname +'/../../config/config');
const logger = require(__dirname +'/../../lib/logger').logger;

// Use bluebird
mongoose.Promise = require('bluebird');
// mongodb    
mongoose.connect(config.db.url);
mongoose.connection.on('open', function() {
    logger.info('Mongoose connected.');
});

var db ={};
db.OAuthAccessToken = require('./OAuthAccessToken');
db.OAuthAuthorizationCode = require('./OAuthAuthorizationCode');
db.OAuthClient = require('./OAuthClient');
db.OAuthRefreshToken = require('./OAuthRefreshToken');
db.OAuthScope = require('./OAuthScope');
db.User = require('./User');

module.exports = db;