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
var config = require('../../../lib/config');
var util = gendok.util;
var cleanup = require('../../../lib/queue/worker/cleanup');
var db = gendok.data.db;
var helper = require('../../helper');
var simple = require('simple-mock');
var expect = require('chai').expect;

describe('gendok.queue.worker.cleanup', function (done) {
  var factory = helper.loadFactories(this);
  var queue = util.createQueue();
  var Job = null;

  before(function () {
    queue.testMode.enter();
  });

  beforeEach(function (done) {
    Job = gendok.data.db.getModel('Job');

    // Since the tests in here can take longer than the defaulte timeout
    // of 2000ms we'll increase it to 10'0000ms or 10s.
    this.timeout(10000);
    done();
  });

  afterEach(function () {
    queue.testMode.clear();
  });

  after(function () {
    queue.testMode.exit();
  });

  it('is a function', function (done) {
    expect(cleanup).to.be.a('function');
    done();
  });

  it('removes the PDF from a job which has reached the ttl', function (done) {
    var values = {
      renderedAt: Date.now(),
      result: 'I\'m a PDF, LOL!'
    };
    var now = values.renderedAt + config.get('cleanup_ttl');
    simple.mock(Date, 'now').returnWith(now);

    factory.create('Job', values, function (err, job) {
      cleanup({}, function (err) {

        expect(err).to.not.exist;

        Job.findById(job.id).then(function (j) {
          expect(j.result).to.be.null;
          done();
        });
      });
    });
  });

  it('doesn\'t remove PDFs from jobs which are below the ttl', function (done) {
    var values = {
      renderedAt: Date.now(),
      result: 'I\'m a PDF, LOL!'
    };
    var now = values.renderedAt + config.get('cleanup_ttl') - 1;
    simple.mock(Date, 'now').returnWith(now);

    factory.create('Job', values, function (err, job) {
      cleanup({}, function (err) {
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

  it('adds itself to the queue after it is done', function (done) {
    var worker = queue.create('cleanup', {});

    worker.save(function () {
      queue.on('job complete', function (id, type) {
        console.log('ENQUEUED, YAY!');
        expect(queue.testMode.jobs.length).to.eql(1);
        expect(queue.testMode.jobs[0].type).to.eql('cleanup');
        expect(type).to.eql('cleanup');
        done();
      });
    });
  });
});
