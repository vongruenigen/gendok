/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var nodemailer = require('nodemailer');
var logger = require('../../logger');
var config = require('../../config');

/**
 * This worker is responsible for sending emails in the background. The SMTP
 * credentials can be configured in the config file.
 *
 * @param {Object}    data  required data (to, subject, html)
 * @param {Function}  done  function to call when the worker is finished
 */
module.exports = function (data, done) {

  if (!data.to || !data.subject || !data.html) {
    logger.error('email data (to, subject, html) is missing or incomplete');
    return done(
      new Error('email data (to, subject, html) is missing or incomplete')
    );
  }

  var mailOptions = {
    from: '"Gendok" <' + config.get('smtp_from') + '>',
    to: data.to,
    subject: data.subject,
    html: data.html
  };
  var smtpConfig = {
    host: config.get('smtp_host'),
    port: config.get('smtp_port'),
    secure: true,   // use SSL
    auth: {
      user: config.get('smtp_username'),
      pass: config.get('smtp_password')
    }
  };

  var transporter = nodemailer.createTransport(smtpConfig);

  transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
      logger.error('Sending of mail failed: ' + error);
      return done(err);
    }

    done();
  });
};
