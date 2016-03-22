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
var helper = require('../../helper');
var convert = require('../../../lib/queue/worker/convert');
var expect = require('chai').expect;
var simple = require('simple-mock');

describe('gendok.queue.worker.convert', function () {
  it('is a function', function () {
    expect(convert).to.be.a('function');
  });

  var factory = helper.loadFactories(this);
  var Job = null;
  var job = null;

  beforeEach(function (done) {
    Job = gendok.data.db.getModel('Job');

    factory.create('Job', function (err, j) {
      expect(err).to.not.exist;
      expect(j).to.exist;

      job = j;
      done();
    });
  });

  it('renders the given template as a pdf and updates the job', function (done) {
    var jobData = {jobId: job.id};

    convert(jobData, function (err) {
      expect(err).to.not.exist;

      Job.findById(job.id).then(function (j) {
        expect(j.result).to.not.be.empty;
        done();
      });
    });
  });

  it('returns an error if no jobId is given or invalid', function (done) {
    var jobData = {jobId: -1};

    convert(jobData, function (err) {
      expect(err).to.exist;
      jobData = {};

      convert(jobData, function (err) {
        expect(err).to.exist;
        done();
      })
    });
  });
});
