
const mongodb = require('../models/index');
const User = mongodb.User;

const config = require(__dirname + '/../../config/config');
const constants = require(__dirname + '/../../config/constants');
const logger = require(__dirname + '/../../lib/logger').logger;
const mail = require(__dirname + '/../components/mailer');

const crypto = require('crypto');


const {check, oneOf, validationResult} = require('express-validator/check');
const {matchedData, sanitize} = require('express-validator/filter');



// Create endpoint /api/users for PUT
exports.checkEmail = function (req, res) {
    var email = req.body.email.toLowerCase();
    User.findOne({username: email})
            .then(function (user) {
                if (user) {
                    return res.status(401).json({
                        message: 'Mail is already in use.',
                        messageCode: '99999',
                        error: true
                    });
                }
                else {
                    return res.status(200).json({
                        message: 'Success!',
                        messageCode: '00000',
                        error: true
                    });
                }
            }).catch(function (err) {
        return res.status(500).json(err);
        logger.error('findUserByEmail - Err: %s', err);
    });





};

exports.putUsers = function (req, res) {
    res.send('NOT IMPLEMENTED!');
};

exports.postReset = function (req, res) {
    var token = req.params.token;
    var password = req.body.password;
    User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } })
        .then(function (user) {
            if (!user) {
                return res.status(400).json({
                    message: 'Invalid token.',
                    messageCode: '99999',
                    error: true
                });
            } else {
                logger.info('encontrado email ' + user.username);
                return User.update({username: user.username}, {
                    password: password,
                    resetPasswordToken: undefined,
                    resetPasswordExpires: undefined})
                        .then(function () {
                            logger.info('save token ' + user.username);

                            mail.send(
                                user.username,
                                'noreplay@joseluisestevez.com',
                                'Your password has been changed',
                                'Hello,\n\n' +
                                'This is a confirmation that the password for your account ' + user.username + ' has just been changed.\n'
                                , function (send) {  });
                                return res.status(200).json({
                                    message: 'Success! Your password has been changed.',
                                    messageCode: '00000',
                                    error: true
                                });

                        }).catch(function (err) {
                            logger.error('User save token - Err: %s', err);
                            return res.status(500).json(err);
                        });   
            }
        }).catch(function (err) {
            logger.error('getReset - Err: %s', err);
            return res.status(500).json(err);
        });
};

exports.getReset = function (req, res) {
    var token = req.params.token;
    User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } })
        .then(function (user) {
            if (!user) {
                return res.status(400).json({
                    message: 'Invalid token.',
                    messageCode: '99999',
                    error: true
                });
            } else {
                return res.status(200).json({
                    message: 'Valid',
                    messageCode: '00000',
                    error: true
                });
            }
        }).catch(function (err) {
            logger.error('getReset - Err: %s', err);
            return res.status(500).json(err);
        });
};

exports.forgot = function (req, res) {
    var email = req.body.email.toLowerCase();
    var token = crypto.randomBytes(48).toString('hex');

    User.findOne({username: email}).then(function (user) {
        if (!user) {
            return res.status(400).json({
                message: 'No account with that email address exists.',
                messageCode: '99999',
                error: true
            });
        }


        logger.info('encontrado email ' + user.username);
        logger.info('token ' + token);

        return User.update({username: user.username}, {
            resetPasswordToken: token,
            resetPasswordExpires: (Date.now() + 3600000)})
                .then(function () {
                    logger.info('save token ' + user.username);

                    mail.send(
                        user.username,
                        'noreplay@joseluisestevez.com',
                        'Password Reset',
                        'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                        'https://' + req.headers.host + '/reset/' + token + '\n\n' +
                        'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                        , function (send) {
                            if (send) {
                                return res.json({
                                    message: 'An e-mail has been sent to ' + user.username + ' with further instructions.',
                                    messageCode: '00000',
                                    error: false
                                });
                            }
                            else {
                                 return res.status(400).json({
                                    message: 'Error.',
                                    messageCode: '99999',
                                    error: true
                                });
                            }
                        });

                   
                }).catch(function (err) {
                    logger.error('User save token - Err: %s', err);
                    return res.status(500).json(err);
                });



    }).catch(function (err) {
        logger.error('findUserByEmail - Err: %s', err);
        return res.status(500).json(err);
    });
};

exports.putVerify= function (req, res) {
    var email = req.body.email;
    User.findOne({username: email})
        .then(function (user) {
            if (!user) {
                return res.status(400).json({
                    message: 'Invalid user.',
                    messageCode: '99999',
                    error: true
                });
            } else {
                var token = crypto.randomBytes(48).toString('hex');
                logger.info('encontrado email ' + user.username);
                return User.update({username: user.username}, {
                    verifyEmailToken: token, 
                    verifyEmailExpires: (Date.now() + 3600000) })
                        .then(function () {
                            logger.info('save token ' + user.username);

                            mail.send(
                                user.username,
                                'noreplay@joseluisestevez.com',
                                'Confirm your registration',
                                'Hello,\n\n' +
                                'Please click on the following link, or paste this into your browser to complete the registration process:\n\n' +
                                'https://' + req.headers.host + '/verify/' + token + '\n\n' +
                                'What is this doing in my mailbox?\n'+
                                'If you do not wish to sign up, you do not need to click through on the link above, and we will not contact you again unless you request it. As such, there is no need to unsubscribe.\n'
                                , function (send) {
                                        if (send) {
                                             return res.json({
                                                message: constants.MSG_REGISTER_SUCCESS,
                                                messageCode: '00000',
                                                error: false
                                            });
                                        }
                                        else {
                                             return res.status(400).json({
                                                message: 'Error.',
                                                messageCode: '99999',
                                                error: true
                                            });
                                        }
                                });

                        }).catch(function (err) {
                            logger.error('User save token - Err: %s', err);
                            return res.status(500).json(err);
                        });  
            }
        }).catch(function (err) {
            logger.error('getReset - Err: %s', err);
            return res.status(500).json(err);
        });
};

exports.postVerify = function (req, res) {
    var token = req.params.token;
    User.findOne({ verifyEmailToken: token, verifyEmailExpires: { $gt: Date.now() } })
        .then(function (user) {
            if (!user) {
                return res.status(400).json({
                    message: 'Invalid token.',
                    messageCode: '99999',
                    error: true
                });
            } else {
                logger.info('encontrado email ' + user.username);
                return User.update({username: user.username}, {
                    verifyEmailToken: undefined,
                    verifyEmailExpires: undefined,
                    verifyEmail: true,
                    activo: true,
                    verificado: true})
                        .then(function () {
                            logger.info('save token ' + user.username);

                            mail.send(
                                user.username,
                                'noreplay@joseluisestevez.com',
                                'Your email has been verified',
                                'Hello,\n\n' +
                                'This is a confirmation that the verified for your account ' + user.username + ' has been verified successfully.\n'
                                , function (send) {  });
                                return res.status(200).json({
                                    message: 'Success! Your password has been changed.',
                                    messageCode: '00000',
                                    error: true
                                });

                        }).catch(function (err) {
                            logger.error('User save token - Err: %s', err);
                            return res.status(500).json(err);
                        });   
            }
        }).catch(function (err) {
            logger.error('getReset - Err: %s', err);
            return res.status(500).json(err);
        });
};

exports.getVerify = function (req, res) {
    var token = req.params.token;
    User.findOne({ verifyEmailToken: token, verifyEmailExpires: { $gt: Date.now() } })
        .then(function (user) {
            if (!user) {
                return res.status(400).json({
                    message: 'Invalid token.',
                    messageCode: '99999',
                    error: true
                });
            } else {
                return res.status(200).json({
                    message: 'Valid',
                    messageCode: '00000',
                    error: true
                });
            }
        }).catch(function (err) {
            logger.error('getReset - Err: %s', err);
            return res.status(500).json(err);
        });
};

// Create endpoint /api/users for POST
exports.postUsers = function (req, res) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({validationsErrors: errors.mapped()});
    }

    var username = req.body.username.toLowerCase();
    var password = req.body.password;
    var scope = 'cedulado';
    var idpersona = req.body.idpersona;
    var cedula = req.body.cedula;
    var letra = req.body.letra;
    var emailalternativo = req.body.emailalternativo.toLowerCase();
    var primernombre = req.body.primernombre;
    var primerapellido = req.body.primerapellido;
    var segundonombre = req.body.segundonombre;
    var segundoapellido = req.body.segundoapellido;
    var sexo = req.body.sexo;
    var fechanacimiento = req.body.fechanacimiento;
    var activo = false;
    var verificado = false;
    var telefono = req.body.telefono;
    var cedulado = req.body.cedulado;
    var idpais = req.body.idpais;
    var nacionalidad = req.body.nacionalidad;
    var callcenter = req.body.callcenter;
    var estadocivil = req.body.estadocivil;

    // Validaciones

    User.findOne({username: username})
            .populate('User')
            .then(function (user) {
                if (user) {
                    return res.status(422).json({
                        message: constants.MSG_REGISTER_EMAIL_USED,
                        messageCode: "E0000",
                        error: true
                    });
                }
            }).catch(function (err) {
        logger.error('getAuthorizationCode - Err: %s', err);
    });

    const date = new Date(fechanacimiento);

    var ageDifMs = Date.now() - date.getTime();
    var ageDate = new Date(ageDifMs);
    var age = Math.abs(ageDate.getUTCFullYear() - 1970);

    if (age < 18) {
        return res.json({
            message: constants.MSG_REGISTER_UNDERAGE,
            messageCode: "E0000",
            error: true
        });
    }

    // FIXME Validar cedula y datos de nombre apellido con data del SAIME 
    // FIXME Validar REGISTER_OBJECTION
    
    var token = crypto.randomBytes(48).toString('hex');

    var user = new User({
        username: username,
        password: password,
        scope: scope,
        idpersona: idpersona,
        cedula: cedula,
        letra: letra,
        emailalternativo: emailalternativo,
        primernombre: primernombre,
        primerapellido: primerapellido,
        segundonombre: segundonombre,
        segundoapellido: segundoapellido,
        sexo: sexo,
        fechanacimiento: fechanacimiento,
        activo: activo,
        verificado: verificado,
        telefono: telefono,
        cedulado: cedulado,
        idpais: idpais,
        nacionalidad: nacionalidad,
        callcenter: callcenter,
        estadocivil: estadocivil,
        verifyEmailToken: token, 
        verifyEmailExpires: (Date.now() + 3600000)
    });


    User.create(user)
            .then(function () {
                mail.send(
                    user.username,
                    'noreplay@joseluisestevez.com',
                    'Confirm your registration',
                    'Hello,\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the registration process:\n\n' +
                    'https://' + req.headers.host + '/verify/' + token + '\n\n' +
                    'What is this doing in my mailbox?\n'+
                    'If you do not wish to sign up, you do not need to click through on the link above, and we will not contact you again unless you request it. As such, there is no need to unsubscribe.\n'
                    , function (send) {
                            if (send) {
                                 return res.json({
                                    message: constants.MSG_REGISTER_SUCCESS,
                                    messageCode: '00000',
                                    error: false
                                });
                            }
                            else {
                                 return res.status(400).json({
                                    message: 'Error.',
                                    messageCode: '99999',
                                    error: true
                                });
                            }
                    });
                   
                
                
            }).catch(function (err) {
        logger.error('User create - Err: %s', err);
    });
};


exports.me = function(req,res){
    
        var user = req.user;
        
        user.User.username = undefined;
        user.User.password = undefined;
        user.User.resetPasswordToken = undefined;
        user.User.resetPasswordExpires = undefined;
        user.User.verifyEmailToken = undefined;
        user.User.verifyEmailExpires = undefined;
        user.User.verifyEmail = undefined;
        
        return res.json(user.User);
        
        
    };