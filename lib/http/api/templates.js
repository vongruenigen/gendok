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

    try {
      var Template = db.getModel('Template');
      logger.debug(Template);
      var templ = Template.build(attrs);
      logger.debug(templ);
    } catch (e) {
      logger.error(e);
      logger.error(e.stack);
    }

    logger.debug('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
    res.json(attrs);
  });
};
