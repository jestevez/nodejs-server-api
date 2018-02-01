'use strict';

const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var OAuthAccessTokenSchema = new Schema({
  access_token: String,
  expires: Date,
  accessTokenExpiresAt: Date,
  scope:  String,
  User:  { type : Schema.Types.ObjectId, ref: 'User' },
  OAuthClient: { type : Schema.Types.ObjectId, ref: 'OAuthClient' }
});

module.exports = mongoose.model('OAuthAccessToken', OAuthAccessTokenSchema);
