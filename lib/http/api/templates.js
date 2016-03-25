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

  app.delete('/api/templates/:id', function (req, res) {
    // TODO: Check if use has access to template and ensure that running
    //       jobs are deleted if a template is deleted.
    var Template = db.getModel('Template');

    Template.findById(req.params.id).then(function (template) {
      if (template) {
        Template.destroy({where: {id: req.params.id}})
                .then(function (affectedRows) {
                  logger.debug('Successfully deleted Template from DB!');
                  res.sendStatus(200);
                });
      } else {
        logger.debug('Cannot find template with id ' + req.params.id);
        res.status(404).end();
      }
    }).catch(function (err) {
      logger.error('Error deleting Template from DB!');
      res.sendStatus(errors.badRequest.code);
    });
  });
};
