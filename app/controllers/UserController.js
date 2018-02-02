
const mongodb = require('../models/index');
const User = mongodb.User;

const config = require(__dirname + '/../../config/config');
const constants = require(__dirname + '/../../config/constants');
const logger = require(__dirname + '/../../lib/logger').logger;


const { check, oneOf, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');

// Create endpoint /api/users for POST
exports.postUsers = function (req, res) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({  validationsErrors: errors.mapped() });
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
        estadocivil: estadocivil

    });

    
    User.create( user )
    .then(function () {
        return res.json({
            message: constants.MSG_REGISTER_SUCCESS,
            messageCode: '00000',
            error: false
        }); 
    }).catch(function (err) {
      logger.error('User create - Err: %s', err);
    });
};

