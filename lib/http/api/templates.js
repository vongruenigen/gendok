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
var util = require('../../util');
var errors = require('./errors');
var helper = require('./helper');

/**
 * Exports the register function for the templates api module.
 *
 * @param {express} app
 * @type {Function}
 */
module.exports = function (app) {
  // Ensure that the user authorized before accessing any of the
  // template API endpoints.
  helper.ensureAuthorizedUser(app, '/api/templates');

  var queue = util.createQueue();

  /**
   * This middleware is used to load the job referenced by the :id param. It
   * then stores the found job in the response object under the 'job' property.
   */
  app.use('/api/templates/:id', function (req, res, next) {
    var Job = res.db.getModel('Job');
    var Template = res.db.getModel('Template');

    Template.findOne({
      where: {
        id: req.params.id,
        userId: res.user.id
      }
    }).then(function (tmpl) {
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

  /**
   * This API route is responsible for creating a new template.
   *
   * POST /api/templates
   */
  app.post('/api/templates', function (req, res) {
    var attrs = {
      userId: res.user.id,
      type: req.body.type,
      body: req.body.body,
      paperFormat: req.body.paperFormat,
      paperMargin: req.body.paperMargin,
      headerHeight: req.body.headerHeight,
      footerHeight: req.body.footerHeight
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
              res.status(errors.validation.code).json(errors.validation.data(err));
            });
  });

  /**
   * This API route is responsible for deleting a template.
   *
   * DELETE /api/templates/:id
   */
  app.delete('/api/templates/:id', function (req, res) {
    res.template.destroy({where: {id: req.params.id}})
                .then(function (affectedRows) {
                  logger.debug('Successfully deleted Template from DB!');
                  res.sendStatus(200);
                });
  });

  /**
   * This API route is responsible for updating an existing template.
   *
   * PUT /api/templates/:id
   */
  app.put('/api/templates/:id', function (req, res) {
    var attrs = {
      type: helper.getIfInAttrs('type', req, res, 'template'),
      body: helper.getIfInAttrs('body', req, res, 'template'),
      paperFormat: helper.getIfInAttrs('paperFormat', req, res, 'template'),
      paperMargin: helper.getIfInAttrs('paperMargin', req, res, 'template'),
      headerHeight: helper.getIfInAttrs('headerHeight', req, res, 'template'),
      footerHeight: helper.getIfInAttrs('footerHeight', req, res, 'template')
    };

    logger.debug('Sanitized attrs: ' + JSON.stringify(attrs));

    res.template.update(attrs)
                .then(function () {
                  logger.debug('Successfully updated Template with id: ' + req.params.id);
                  res.status(200).json(res.template.toPublicObject());
                }).catch(function (err) {
                  logger.error('Error updating the Template with id: ' + req.params.id);
                  res.status(errors.validation.code).json(errors.validation.data(err));
                });
  });

  /**
   * This API route is responsible for creating a render job for the template
   * with the specified id. It returns a Job object, which can then be used to
   * interact with the jobs API (see lib/http/api/jobs.js).
   *
   * POST /api/templates/:id/render
   */
  app.post('/api/templates/:id/render', function (req, res) {
    var Job = res.db.getModel('Job');

    var attrs = {
      templateId: req.params.id,
      payload: req.body.payload || {},
      async: req.body.async || false,
      state: 'pending',
      format: req.body.format || 'pdf'
    };

    logger.debug('Sanitized attrs: ' + JSON.stringify(attrs));

    Job.build(attrs)
       .save()
       .then(function (job) {
         logger.debug('Successfully saved new Job to DB!');

         job.schedule(queue, function (err, j) {
           if (err) {
             logger.error('Error saving a queue job: ' + err);
             res.status(errors.internal.code).send(errors.internal.data);
           } else {
             // If the async flag is set to true, we only return the job as
             // a JSON object. If it is set to false, which it is by default,
             // we wait for the job to finish and then return the results
             // immediately.
             if (job.async) {
               res.status(201).json(job.toPublicObject());
             } else {
               // Wait for the job to complete and then reload the Job object
               // from the database and return the result.
               j.on('complete', function () {
                 job.reload().then(function () {
                   helper.sendJobResult(res, job);
                 });
               });
             }
           }
         });
       }).catch(function (err) {
         logger.error('Error saving the Job to DB or queue: ' + err);
         res.status(errors.badRequest.code).json(errors.badRequest.data);
       });
  });

  /**
   * This route is responsible for returning the specified template template
   * as a JSON object.
   *
   * GET /api/templates/:id
   */
  app.get('/api/templates/:id', function (req, res) {
    res.status(200).send(res.template.toPublicObject());
  });

  /**
   * This route is responsible for returning all templates of the current user
   * as a JSON array of objects.
   *
   * GET /api/templates
   */
  app.get('/api/templates', function (req, res) {
    var Template = res.db.getModel('Template');
    var responseObject = [];

    Template.findAll({where: {userId: res.user.id}}).then(function (templs) {
      templs.forEach(function (template) {
        responseObject.push(template.toPublicObject());
      });

      res.json(responseObject);
    });
  });
};
