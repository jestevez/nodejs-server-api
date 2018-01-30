'use strict';

const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var UserSchema = new Schema({
  username:  String,
  password:  String,
  scope: String
});

module.exports = mongoose.model('User', UserSchema);

