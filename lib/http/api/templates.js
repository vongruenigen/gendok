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
 * @param {Config} config
 * @type {Function}
 */
module.exports = function (app, config) {
  /**
   * This middleware is used to load the job referenced by the :id param. It
   * then stores the found job in the response object under the 'job' property.
   */
  app.use('/api/templates/:id', function (req, res, next) {
    var Job = res.db.getModel('Job');
    var Template = res.db.getModel('Template');

    Template.findById(req.params.id)
            .then(function (tmpl) {
              if (!tmpl) {
                logger.error('Template not found in DB: ' + req.params.id);
                res.status(errors.notFound.code).json(errors.notFound.data);
              } else {
                res.template = tmpl;
                next();
              }
            }).catch(function (err) {
              logger.error('Error finding the template in DB: ' + err);
              res.status(errors.badRequest.code).json(errors.badRequest.data);
            });
  });

  app.post('/api/templates', function (req, res) {
    if (!res.user) {
      logger.error('User not in response object: ' + res.user);
      res.status(errors.unauthorized.code).json(errors.unauthorized.data);
    }

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
            }).catch(function (err) {
              logger.error('Error saving the Template to DB: ' + err);
              res.status(errors.badRequest.code).json(errors.badRequest.data);
            });
  });

  app.delete('/api/templates/:id', function (req, res) {
    if (!res.user) {
      logger.error('User not in response object: ' + res.user);
      return res.status(errors.unauthorized.code)
                .json(errors.unauthorized.data);
    }

    // TODO: Check if use has access to template and ensure that running
    //       jobs are deleted if a template is deleted.
    var Template = res.db.getModel('Template');

    Template.destroy({where: {id: req.params.id}})
            .then(function (affectedRows) {
              logger.debug('Successfully deleted Template from DB!');
              res.sendStatus(200);
            });
  });

  app.put('/api/templates/:id', function (req, res) {
    if (!res.user) {
      logger.error('User not in response object: ' + res.user);
      return res.status(errors.unauthorized.code)
                .json(errors.unauthorized.data);
    }

    var Template = res.db.getModel('Template');

    var attrs = {
      type: req.body.type || res.template.type,
      body: req.body.body || res.template.body
    };

    logger.debug('Sanitized attrs: ' + JSON.stringify(attrs));

    res.template.update(attrs)
                .then(function () {
                  logger.debug('Successfully updated Template with id: ' + req.params.id);
                  res.status(200).json(res.template.toPublicObject());
                }).catch(function (err) {
                  logger.error('Error updating the Template with id: ' + req.params.id);
                  res.status(errors.badRequest.code).json(errors.badRequest.data);
                });
  });

  app.post('/api/templates/:id/render', function (req, res) {
    if (!res.user) {
      logger.error('User not in response object: ' + res.user);
      return res.status(errors.unauthorized.code)
                .json(errors.unauthorized.data);
    }

    var Job = res.db.getModel('Job');

    var attrs = {
      templateId: req.params.id,
      payload: req.body,
      state: 'pending'
    };

    logger.debug('Sanitized attrs: ' + JSON.stringify(attrs));

    Job.build(attrs)
       .save()
       .then(function (job) {
         logger.debug('Successfully saved new Job to DB!');

         // Schedule a for our worker queue
         var newJob = res.queue.create('convert', {jobId: job.id});

         newJob.save(function (err) {
           if (err) {
             logger.error('Error saving a job: ' + err);
             res.status(errors.internal.code).send(errors.internal.data);
           } else {
             res.status(201).json(job.toPublicObject());
           }
         });
       }).catch(function (err) {
         logger.error('Error saving the Job to DB: ' + err);
         res.status(errors.badRequest.code).json(errors.badRequest.data);
       });
  });
};
