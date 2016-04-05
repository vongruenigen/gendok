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
var cleanup = require('../../../lib/queue/worker/cleanup');
var db = gendok.data.db;
var helper = require('../../helper');
var simple = require('simple-mock');
var expect = require('chai').expect;

describe('gendok.queue.worker.cleanup', function (done) {
  var factory = helper.loadFactories(this);
  var Job = null;
  var ttl = 20000000;

  beforeEach(function (done) {
    Job = gendok.data.db.getModel('Job');

    // Since the tests in here can take longer than the defaulte timeout
    // of 2000ms we'll increase it to 10'0000ms or 10s.
    this.timeout(10000);
    done();
  });

  it('is a function', function (done) {
    expect(cleanup).to.be.a('function');
    done();
  });

  it('removes the PDF from a job which has reached the ttl', function (done) {
    var workerData = {data: {ttl: ttl}};
    var values = {
      renderedAt: Date.now(),
      result: 'I\'m a PDF, LOL!'
    };
    var now = values.renderedAt + ttl;
    simple.mock(Date, 'now').returnWith(now);

    factory.create('Job', values, function (err, job) {
      cleanup(workerData, function (err) {

        expect(err).to.not.exist;

        Job.findById(job.id).then(function (j) {
          expect(j.result).to.be.null;
          done();
        });
      });
    });
  });

  it('doesn\'t remove PDFs from jobs which are below the ttl', function (done) {
    var workerData = {data: {ttl: ttl}};
    var values = {
      renderedAt: Date.now(),
      result: 'I\'m a PDF, LOL!'
    };
    var now = values.renderedAt + ttl - 1;
    simple.mock(Date, 'now').returnWith(now);

    factory.create('Job', values, function (err, job) {
      cleanup(workerData, function (err) {
        expect(err).to.not.exist;

        Job.findById(job.id).then(function (j) {
          expect(j.result).to.not.be.null;
          var resultString = j.result.toString();
          expect(resultString).to.eql(values.result);
          done();
        });
      });
    });
  });

  it('adds itself to the queue after it is done');
});
