/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var gendok = require('../../../');
var db = gendok.data.db;
var Config = gendok.config;
var convert = gendok.queue.worker.convert;
var Compiler = gendok.compiler.compiler;
var helper = require('../../helper');
var expect = require('chai').expect;
var simple = require('simple-mock');
var AdmZip = require('adm-zip');

describe('gendok.queue.worker.convert', function () {
  it('is a function', function () {
    expect(convert).to.be.a('function');
  });

  var factory = helper.loadFactories(this);
  var Job = null;
  var job = null;

  beforeEach(function (done) {
    Job = gendok.data.db.getModel('Job');

    // Since the tests in here can take longer than the defaulte timeout
    // of 2000ms we'll increase it to 10'0000ms or 10s.
    this.timeout(10000);

    factory.create('Job', function (err, j) {
      expect(err).to.not.exist;
      expect(j).to.exist;

      job = j;
      done();
    });
  });

  it('renders the given template as a pdf', function (done) {
    var queueJobData = {data: {jobId: job.id}};

    convert(queueJobData, function (err) {
      expect(err).to.not.exist;

      Job.findById(job.id).then(function (j) {
        expect(j.result).to.not.be.empty;

        var pdfString = j.result.toString();

        // The header of every PDF file always starts with %PDF-1.x where
        // can be any number from 1-7 currently.
        expect(pdfString).to.match(/%PDF-1\.[0-9]+\n/);
        done();
      }).catch(done);
    });
  });

  it('returns an error if no jobId is given or invalid', function (done) {
    var queueJobData = {data: {jobId: -1}};

    convert(queueJobData, function (err) {
      expect(err).to.exist;
      queueJobData = {data: {}};

      convert(queueJobData, function (err) {
        expect(err).to.exist;
        done();
      });
    });
  });

  it('rejects jobs which are already finished', function (done) {
    var queueJobData = {data: {jobId: job.id}};

    job.update({state: 'finished'}).then(function (j) {
      expect(j).to.exist;

      convert(queueJobData, function (err) {
        expect(err).to.exist;
        done();
      });
    }).catch(done);
  });

  it('updates the state of the job after it has finished', function (done) {
    var queueJobData = {data: {jobId: job.id}};

    convert(queueJobData, function (err) {
      expect(err).to.not.exist;

      Job.findById(job.id).then(function (j) {
        expect(j).to.exist;
        expect(j.state).to.eql('finished');
        done();
      }).catch(done);
    });
  });

  it('renders the template with the compiler before converting to pdf', function (done) {
    // Attributes to ensure that we use an actual compiler for this tests
    var templateAttrs = {
      type: 'mustache',
      body: '<html><head><title>blub</title></head>' +
            '<body><h1>{{data}}</h1></body></html>'
    };

    var jobAttrs = {payload: {data: 'bluebdiblub'}};

    factory.create('Template', templateAttrs, function (err, t) {
      jobAttrs.templateId = t.id;

      factory.create('Job', jobAttrs, function (err, j) {
        var queueJobData = {data: {jobId: j.id}};

        convert(queueJobData, function (err) {
          expect(err).to.not.exist;

          // Compare contents of generated result with our generated pdf
          j.reload().then(function (j) {
            helper.parsePdf(j.result, function (err, data) {
              expect(err).to.not.exist;
              expect(data.text).to.include(jobAttrs.payload.data);
              done(err);
            });
          }).catch(done);
        });
      });
    });
  });

  it('renders a template for each payload and returns a zip', function (done) {
    var templateAttrs = {
      type: 'mustache',
      body: '<html><head><title>blub</title></head>' +
            '<body><h1>{{data}}</h1></body></html>'
    };

    var jobAttrs = {payload: [{data: 'bluebdiblub'},
                              {data: 'laksdfjaldk'},
                              {data: 'owiqopadsqd'}]};

    factory.create('Template', templateAttrs, function (err, t) {
      jobAttrs.templateId = t.id;

      factory.create('Job', jobAttrs, function (err, j) {
        var queueJobData = {data: {jobId: j.id}};

        convert(queueJobData, function (err) {
          expect(err).to.not.exist;

          // Compare contents contents of the zip to the expected output
          j.reload().then(function (j) {
            var zip = new AdmZip(j.result);
            var entries = zip.getEntries();
            var counter = 0;

            entries.forEach(function (e, i) {
              expect(e.entryName.endsWith(job.format)).to.be.true;

              helper.parsePdf(e.getData(), function (err, data) {
                expect(err).to.not.exist;

                expect(jobAttrs.payload.some(function (p) {
                  return data.text.indexOf(p.data) !== -1;
                })).to.be.true;

                if (jobAttrs.payload.length === ++counter) {
                  done();
                }
              });
            });
          }).catch(done);
        });
      });
    });
  });
});
