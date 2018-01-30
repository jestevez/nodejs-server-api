'use strict';

const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var OAuthAuthorizationCodeSchema = new Schema({
  authorization_code: String,
  expires: Date,
  redirect_uri:  String,
  scope:  String,
  User:  { type : Schema.Types.ObjectId, ref: 'User' },
  OAuthClient: { type : Schema.Types.ObjectId, ref: 'OAuthClient' }
});

module.exports = mongoose.model('OAuthAuthorizationCode', OAuthAuthorizationCodeSchema);

