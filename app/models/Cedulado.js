'use strict';

const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var CeduladoSchema = new Schema({
    orden: Number,
    idpersona: String,
    primernombre: String,
    primerapellido: String,
    segundonombre: String,
    segundoapellido: String,
    sexo: String,
    numerocedula: String,
    letra: String,
    fechanacimiento: Date,
    pais: String,
    cedulado: Number,
    direccion: String,
    pasaporte: String,
    idparroquia: String,
    edad: Number
});

module.exports = mongoose.model('Cedulado', CeduladoSchema);