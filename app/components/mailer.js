
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

const config = require(__dirname + '/../../config/config');
const logger = require(__dirname + '/../../lib/logger').logger;


function send(_to, _from, _subject, _text, cb) {
    var transporter = nodemailer.createTransport(smtpTransport({
        service: config.smtpService,
        host: config.smtpHost,
        auth: {
            user: config.smtpUser,
            pass: config.smtpPassword
        }
    }));
    var mailOptions = {
        to: _to,
        from: _from,
        subject: _subject,
        text: _text
    };

    return transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            logger.error('error ', error);
            //console.log(error);
            cb(false);
        } else {
            logger.info('Email sent: ' + info.response);
            cb(true);
        }
    });


}
;

module.exports.send = send;