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
var db = require('../../data/db');

/**
 * Worker for converting an existing template via html-pdf and phantomjs
 * to the desired output format which can be either PDF or PNG. It expects
 * an object containing a jobId property.
 *
 * @param {Object} job The job with the required data
 * @param {Function} done Function to call when the worker finished the job
 */
module.exports = function (data, done) {
  // TODO: FIX!
  var Job = db.getModel('Job');

  if (!data.jobId) {
    return done(new Error('jobId is required'));
  }

  Job.findById(data.jobId).then(function (job) {
    if (!job) {
      return done(new Error('invalid jobId'));
    }

    job.getTemplate().then(function (templ) {
      var convert = htmlToPdf();

      // TODO: Add compilation of template and additional css
      var html = templ.template;

      convert({html: html}, function (err, pdf) {
        if (err) {
          return done(new Error('error while converting html to pdf'));
        }

        var bufs = [];

        // Gather all PDF data from the result stream
        pdf.stream.on('data', function (d) {
          bufs.push(d);
        }).on('end', function () {
          var pdfBuffer = Buffer.concat(bufs);
          job.result = pdfBuffer;

          job.save().then(function (j) {
            if (!j) {
              return done(new Error('error while saving result in job'));
            }

            done();
          });
        });
      });
    });
  });
};
