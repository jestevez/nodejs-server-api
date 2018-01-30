'use strict';

const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var OAuthScopeSchema = new Schema({
  scope:  String,
  is_default: Boolean
});

module.exports = mongoose.model('OAuthScope', OAuthScopeSchema);
