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

      var Template = res.db.getModel('Template');

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

  app.put('/api/templates/:id', function (req, res) {
    if (!res.user) {
      logger.error('User not in response object: ' + res.user);
      res.status(errors.unauthorized.code).json(errors.unauthorized.data);
    } else {
      var attrs = {
        type: req.body.type,
        body: req.body.body
      };

      logger.debug('Sanitized attrs: ' + JSON.stringify(attrs));

      var Template = res.db.getModel('Template');

      Template.findById(req.params.id)
        .then(function (template) {
          if (template) {
            template.update(attrs)
            .then(function () {
              logger.debug('Successfully updated Template with id: ' + req.params.id + 'to DB!');
              res.status(200).json(template.toPublicObject());
            })
            .catch(function (err) {
              logger.error('Error updating the Template with id: ' + req.params.id +
              ' to DB: ' + err);
              res.status(errors.badRequest.code).json(errors.badRequest.data);
            });
          } else {
            logger.error('Error updating the Template with id: ' + req.params.id +
            ' not found in the DB');
            res.status(errors.notFound.code).json(errors.notFound.data);
          }
        });
    }
  });
};
