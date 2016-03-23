/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var logger = require('../../logger');
var db = require('../../data/db');

/**
 * Exports the register function for the templates api module.
 *
 * @param {express} app
 * @type {Function}
 */
module.exports = function (app) {
  app.post('/api/templates', function (req, res) {
    logger.debug('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');

    logger.debug('Body: ' + req.body);
    var attrs = {
      'type': req.body.type,
      'body': req.body.body
    }
    logger.debug('Sanitized attrs: ' + JSON.stringify(attrs));

    var Template = db.getModel('Template')
    Template.build(attrs)
            .save()
            .then(function() {
              logging.debug('Everything went a-ok!')
              res.status(201);
              res.json(template.toPublicObject());
            })
            .catch(function(err) {
              logger.error(err);
              res.status(400);
              res.send('ERROR!')
            });
    logger.debug('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<');

  });
};
