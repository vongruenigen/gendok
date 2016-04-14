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
var util = require('../../util');
var env = require('../../env');
var Compiler = require('../../compiler').compiler;
var AdmZip = require('adm-zip');
var db = require('../../data/db');
var format = require('util').format;

// Kill phantomjs processes as soon as this process exits
/* istanbul ignore next */
process.once('exit', function () {
  convert.kill();
});

/**
 * This function uses the template associated with the given job and the payload
 * to render it to HTML.
 *
 * @param {Job} job The job for which to compile the associated template
 * @param {Object} payload The payload for this compilation.
 * @param {Function} fn The callback to invoke after the compilation
 */
var _compileAssociatedTemplate = function (job, payload, fn) {
  job.getTemplate().then(function (t) {
    var comp = new Compiler(t.type);
    comp.compile(t.body, payload, fn);
  });
};

/**
 * Converts the given HTML string to a PDF.
 *
 * @param {String} html The HTML to convert
 * @param {Function} fn The callback
 */
var _convertHtml = function (html, fn) {
  var opts = {
    html: html,
    phantomPath: phantomjs.path,
    paperSize: {
      format: 'a4',
      margin: '0px',
      headerHeight: '0px',
      footerHeight: '0px',
      width: '1000px',
      height: '1414px'
    }
  };

  convert(opts, function (err, pdf) {
    var bufs = [];

    // Gather all PDF data from the result stream
    pdf.stream.on('data', function (d) {
      bufs.push(d);
    }).on('end', function () {
      fn(null, Buffer.concat(bufs));
    }).on('error', function (err) {
      fn(err, null);
    });
  });
};

/**
 * Stores the given pdf buffers in the given job object. If multiple buffers are
 * given, a pdf is created, in case of a single buffer it's just set as the result.
 *
 * @param {Array} bufs The array of pdf buffers
 * @param {Job} job The job to store the results in
 * @param {Function} fn The callback
 */
var _storeResult = function (bufs, job, fn) {
  if (bufs.length === 1) {
    job.result = bufs[0];
  } else {
    var zip = new AdmZip();

    bufs.forEach(function (b, i) {
      zip.addFile(format('result_%d_%d.%s', job.id, i, job.format), b);
    });

    job.result = zip.toBuffer();
  }

  job.state = 'finished';
  job.renderedAt = new Date(Date.now());

  job.save().then(function () {
    fn();
  }).catch(fn);
};

/**
 * Worker for converting an existing template via html-pdf and phantomjs
 * to the desired output format which can be either PDF or PNG. It expects
 * an object containing a jobId property.
 *
 * @param {Object} job The job with the required data
 * @param {Function} done Function to call when the worker finished the job
 */
module.exports = function (j, done) {
  var Job = db.getModel('Job');
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

    // We don't process the same job twice
    if (job.state === 'finished') {
      return done(new Error('job is already finished'));
    }

    // The compilation will be done via promises in case multiple documents
    // need to be rendered. The resulting pdf buffers will be stored in the
    // pdfBufs variable below.
    var proms = [];
    var pdfBufs = [];
    var payloads = util.isArray(job.payload) ? job.payload : [job.payload];

    // Iterate over all payloads and start a compilation task for each
    payloads.forEach(function (p) {
      proms.push(
        new Promise(function (resolve, reject) {
          _compileAssociatedTemplate(job, p, function (err, html) {
            if (err) {
              return reject(new Error('error while compiling template: ' + err));
            }

            logger.debug('starting conversion from html to pdf');

            _convertHtml(html, function (err, buf) {
              if (err) {
                return reject(err);
              }

              pdfBufs.push(buf);
              resolve();
            });
          });
        })
      );
    });

    Promise.all(proms).then(function () {
      _storeResult(pdfBufs, job, done);
    }).catch(function (err) {
      // Set job state to failed in case anything bad happens
      job.state = 'failed';

      job.save.then(function () {
        done(err);
      }).catch(done);
    });
  }).catch(done);
};
