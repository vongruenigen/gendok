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
var helper = require('./helper');

/**
 * Exports the register function for the jobs api module.
 *
 * @param {express} app
 * @type {Function}
 */
module.exports = function (app) {
  // Ensure that the user authorized before accessing any of the
  // jobs API endpoints.
  helper.ensureAuthorizedUser(app, '/api/jobs');

  /**
   * This middleware is used to load the job referenced by the :id param. It
   * then stores the found job in the response object under the 'job' property.
   */
  app.use('/api/jobs/:id', function (req, res, next) {
    var Job = res.db.getModel('Job');
    var Template = res.db.getModel('Template');

    Job.findById(req.params.id)
       .then(function (job) {
         if (!job) {
           logger.error('Job not found in DB: ' + req.params.id);
           res.status(errors.notFound.code).json(errors.notFound.data);
         } else {
           job.getTemplate()
           .then(function (templ) {
             if (templ.userId !== res.user.id) {
               logger.error('Job not found in DB: ' + req.params.id);
               res.status(errors.notFound.code).json(errors.notFound.data);
             } else {
               res.job = job;
               next();
             }
           });
         }
       }).catch(function (err) {
         logger.error('Error finding the Job in DB: ' + err);
         res.status(errors.badRequest.code).json(errors.badRequest.data);
       });
  });

  /**
   * This API route is responsible for retrieving the data of a job object.
   *
   * GET /api/jobs/:id
   */
  app.get('/api/jobs/:id', function (req, res) {
    res.status(200).json(res.job.toPublicObject());
  });

  /**
   * This API route is responsible for retrieving the result of a rendering
   * job. If the job state is not 'finished' when this route is called, an error
   * will be returned with the appropriate status code (see errors.js).
   *
   * GET /api/jobs/:id/download
   */
  app.get('/api/jobs/:id/download', function (req, res) {
    if (res.job.state === 'finished') {
      var filename = 'job_result' + res.job.id + '.pdf';

      res.set('Content-Disposition', 'attachment; filename="' + filename + '";');
      res.set('Content-Type', 'application/pdf');
      res.status(200).send(res.job.result);
    } else {
      logger.error('Job not finished: ' + res.job.status);
      res.status(errors.forbidden.code).json(errors.forbidden.data);
    }
  });
};
