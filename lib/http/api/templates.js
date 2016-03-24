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
var errors = require('./errors');

/**
 * Exports the register function for the templates api module.
 *
 * @param {express} app
 * @type {Function}
 */
module.exports = function (app) {
  app.post('/api/templates', function (req, res) {
    if (!res.user) {
      logger.error('User not in response object: ' + res.user);
      res.status(errors.unauthorized.code).json(errors.unauthorized.data);
    } else {
      var attrs = {
        userId: res.user.id,
        type: req.body.type,
        body: req.body.body
      };
      logger.debug('Sanitized attrs: ' + JSON.stringify(attrs));

      var Template = db.getModel('Template');
      Template.build(attrs)
              .save()
              .then(function (template) {
                logger.debug('Successfully saved new Template to DB!');
                res.status(201).json(template.toPublicObject());
              })
              .catch(function (err) {
                logger.error('Error saving the Template to DB: ' + err);
                res.status(errors.badRequest.code).json(errors.badRequest.data);
              });
    }
  });
};