/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var phantomjs = require('phantomjs-prebuilt');
var htmlToPdf = require('phantom-html-to-pdf');
var convert = htmlToPdf();
var logger = require('../../logger');
var env = require('../../env');

// Kill phantomjs processes as soon as this process exits
/* istanbul ignore next */
process.once('exit', function () {
  convert.kill();
});

/**
 * Worker for converting an existing template via html-pdf and phantomjs
 * to the desired output format which can be either PDF or PNG. It expects
 * an object containing a jobId property.
 *
 * @param {Object} job The job with the required data
 * @param {Function} done Function to call when the worker finished the job
 */
module.exports = function (j, done) {
  // TODO: FIX! Without this, our tests fail when running coverage. It seems
  //            like istanbul is intercepting the require() function somehow.
  var Job = require('../../data/db').getModel('Job');
  var data = j.data;

  if (!data.jobId) {
    logger.error('jobId missing in data');
    return done(new Error('jobId is required'));
  }

  logger.info('starting to work on convert job ' + data.jobId);

  Job.findById(data.jobId).then(function (job) {
    if (!job) {
      return done(new Error('jobId is invalid'));
    }

    if (job.state === 'finished') {
      return done(new Error('job is already finished'));
    }

    job.getTemplate().then(function (templ) {
      // TODO: Add compilation of template and additional css
      var html = templ.body;
      var opts = {html: html, phantomPath: phantomjs.path};

      logger.info('starting conversion from html to pdf');

      convert(opts, function (err, pdf) {
        var bufs = [];

        // Gather all PDF data from the result stream
        pdf.stream.on('data', function (d) {
          bufs.push(d);
        }).on('end', function () {
          var pdfBuffer = Buffer.concat(bufs);

          job.result = pdfBuffer;
          job.state = 'finished';
          job.renderedAt = new Date();

          job.save().then(function (j) {
            logger.info('finished conversion from html to pdf');
            done(j ? null : new Error('error while saving job result'));
          }).catch(done);
        });
      });
    }).catch(done);
  }).catch(done);
};
