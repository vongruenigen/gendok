/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var htmlToPdf = require('phantom-html-to-pdf');
var convert = htmlToPdf();
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
module.exports = function (data, done) {
  // TODO: FIX! Without this, our tests fail when running coverage. It seems
  //            like istanbul is intercepting the require() function somehow.
  var Job = require('../../data/db').getModel('Job');

  if (!data.jobId) {
    return done(new Error('jobId is required'));
  }

  Job.findById(data.jobId).then(function (job) {
    if (!job) {
      return done(new Error('jobId is invalid'));
    }

    if (job.state === 'finished') {
      return done(new Error('job is already finished'));
    }

    job.getTemplate().then(function (templ) {
      // TODO: Add compilation of template and additional css
      var html = templ.template;

      convert({html: html}, function (err, pdf) {
        var bufs = [];

        // Gather all PDF data from the result stream
        pdf.stream.on('data', function (d) {
          bufs.push(d);
        }).on('end', function () {
          var pdfBuffer = Buffer.concat(bufs);

          job.result = pdfBuffer;
          job.state = 'finished';

          job.save().then(function (j) {
            // Kill the phantomjs process if we're in the test environment
            // because otherwise our test runner never finishs because of the
            // open connection to the phantomjs process. This might take longer
            // because we need to start a new phantomjs process for each job
            // processed, but this way we can ensure that our test runner act-
            // ually finishes at the end.
            if (env.is('test')) {
              convert.kill();
            }

            done();
          }).catch(done);
        });
      });
    }).catch(done);
  }).catch(done);
};
