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
 * Exports the register function for the jobs api module.
 *
 * @param {express} app
 * @param {Config} config
 * @param {Queue} queue
 * @type {Function}
 */
module.exports = function (app, config, queue) {
  app.get('/api/jobs/:id', function (req, res) {
    var Job = res.db.getModel('Job');

    Job.findById(req.params.id)
       .then(function (job) {
         if (!job) {
           logger.error('Job not found in DB: ' + req.params.id);
           res.status(errors.notFound.code).json(errors.notFound.data);
         } else {
           logger.debug('Successfully found Job in DB!');
           res.status(200).json(job.toPublicObject());
         }
       })
       .catch(function (err) {
         logger.error('Error finding the Job in DB: ' + err);
         res.status(errors.badRequest.code).json(errors.badRequest.data);
       });
  });

  app.get('/api/jobs/:id/download', function (req, res) {
    var Job = res.db.getModel('Job');
    Job.findById(req.params.id)
       .then(function (job) {
         if (!job) {
           logger.error('Job not found in DB: ' + req.params.id);
           res.status(errors.notFound.code).json(errors.notFound.data);
         } else {
           if (job.state === 'finished') {
             var filename = 'job_result' + job.id + '.pdf';

             res.set('Content-Disposition', 'attachment; filename="' + filename + '";');
             res.set('Content-Type', 'application/pdf');
             res.status(200).send(job.result);
           } else {
             logger.error('Job not finished: ' + job.status);
             res.status(errors.notFinished.code).json(errors.notFinished.data);
           }
         }
       })
       .catch(function (err) {
         logger.error('Error finding the Job in DB: ' + err);
         res.status(errors.badRequest.code).json(errors.badRequest.data);
       });
  });
};
