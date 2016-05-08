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
var JsZip = require('jszip');
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
 * @param {Template} templ The template of the to-be-converted job
 * @param {Object} payload The payload for this compilation.
 * @param {Function} fn The callback to invoke after the compilation
 */
var _compileAssociatedTemplate = function (templ, payload, fn) {
  var comp = new Compiler(templ.type);
  comp.compile(templ.body, payload, fn);
};

/**
 * Converts the given HTML string to a PDF.
 *
 * @param {String} html The HTML to convert
 * @param {Object} paperSize The paperSize attributes
 * @param {Function} fn The callback
 */
var _convertHtml = function (html, paperSize, fn) {
  var opts = {
    html: html,
    phantomPath: phantomjs.path,
    paperSize: paperSize
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
  var saveJob = function () {
    job.state = 'finished';
    job.renderedAt = new Date(Date.now());

    job.save().then(function () {
      fn();
    }).catch(fn);
  };

  if (bufs.length === 1) {
    job.result = bufs[0];
    saveJob();
  } else {
    var zip = new JsZip();

    bufs.forEach(function (b, i) {
      zip.file(format('result_%d_%d.%s', job.id, i, job.format), b);
    });

    zip.generateAsync({type: 'nodebuffer'}).then(function (b) {
      job.result = b;
      saveJob();
    });
  }
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

    // Get Template for retrieving the paper format attributes
    job.getTemplate().then(function (templ) {
      // The compilation will be done via promises in case multiple documents
      // need to be rendered. The resulting pdf buffers will be stored in the
      // pdfBufs variable below.
      var proms = [];
      var pdfBufs = [];
      var payloads = util.isArray(job.payload) ? job.payload : [job.payload];
      var paperSize = {
        format: templ.paperFormat,
        margin: templ.paperMargin,
        headerHeight: templ.headerHeight,
        footerHeight: templ.footerHeight
      };

      logger.debug('Converter paperSize Attributes: ' + JSON.stringify(paperSize));

      // Iterate over all payloads and start a compilation task for each
      payloads.forEach(function (p) {
        proms.push(
          new Promise(function (resolve, reject) {
            _compileAssociatedTemplate(templ, p, function (err, html) {
              if (err) {
                return reject(new Error('error while compiling template: ' + err));
              }

              if (templ.additionalCss.trim()) {
                html = util.addCssToHtml(html, templ.additionalCss);
              }

              logger.debug('starting conversion from html to pdf');

              _convertHtml(html, paperSize, function (err, buf) {
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
    });
  }).catch(done);
};
