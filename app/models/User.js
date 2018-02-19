'use strict';

const bcrypt = require('bcrypt-nodejs');
const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var UserSchema = new Schema({
    username:            { type: String, required: true, unique : true},
    password:            { type: String, required: true },
    scope:               { type: String, required: true },  
    
    resetPasswordToken:  { type: String, required: false, unique : true},  
    resetPasswordExpires:{ type: Date, required: false},
    verifyEmailToken:    { type: String, required: false, unique : true},  
    verifyEmailExpires:  { type: Date, required: false},
    verifyEmail:         { type: Boolean, default: false},
    
    idregistrousuario:   { type: String, required: false },
    idpersona:           { type: String, required: true },
    cedula:              { type: String, required: true },
    letra:               { type: String, required: true },
    emailalternativo:    { type: String, required: true },
    primernombre:        { type: String, required: true },
    primerapellido:      { type: String, required: true },
    segundonombre:       { type: String, required: true },
    segundoapellido:     { type: String, required: true },
    sexo:                { type: String, required: true },
    fechanacimiento:     { type: Date, default: Date.now },
    activo:              { type: Boolean, default: false},
    verificado:          { type: Boolean, default: false},
    telefono:            { type: String, required: true },
    cedulado:            { type: String, required: true },
    idpais:              { type: String, required: true },
    nacionalidad:        { type: String, required: true },
    callcenter:          { type: String, required: false },
    estadocivil:         { type: String, required: true }
});

UserSchema.virtual('email').get(function() {
    return this.username;
}).set(function(username) {
    this.username = username.toLowerCase();
});

UserSchema.path('username').validate(function (email) {
   var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
   return emailRegex.test(email);
}, 'The e-mail field cannot be empty.');

// Execute before each user.save() call
UserSchema.pre('save', function(callback) {
  var user = this;
  
  // Breakout of the password hasn't changed
  if (!user.isModified('password')) return callback();

  // Password changed so we need to hash it
  bcrypt.genSalt(5, function(err, salt) {
    if (err) return callback(err);

    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return callback(err);
      user.password = hash;
      callback();
    });
  });
});

UserSchema.methods.verifyPassword = function(password, cb) {
  bcrypt.compare(password, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

module.exports = mongoose.model('User', UserSchema);

