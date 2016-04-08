/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var helper = require('../../helper');
var db = require('../../..').data.db;
var expect = require('chai').expect;
var simple = require('simple-mock');

describe('gendok.data.model.job', function () {
  var factory = helper.loadFactories(this);
  var queue = helper.createQueue(this);
  var Job = null;

  beforeEach(function () {
    Job = db.getModel('Job');
  });

  it('is an object', function () {
    expect(Job).to.be.an('object');
  });

  describe('the factory', function () {
    it('inserts a job into the db', function (done) {
      factory.create('Job', function (err, job) {
        expect(err).to.not.exist;
        expect(job).to.exist;
        done();
      });
    });
  });

  describe('isBatch()', function () {
    it('returns true if the payload is an array of object', function () {
      var job = Job.build({payload: [{}, {}, {}]});
      expect(job.isBatch()).to.be.true;
    });

    it('returns false if the payload is a single object', function () {
      var job = Job.build({payload: {}});
      expect(job.isBatch()).to.be.false;
    });
  });

  describe('validation', function () {
    describe('.templateId', function () {
      it('may not be empty', function (done) {
        var values = {templateId: ''};

        factory.build('Job', values, function (err, job) {
          expect(err).to.not.exist;
          expect(job.templateId).to.eql(values.templateId);

          job.validate().then(function (err) {
            expect(err).to.exist;
            expect(err.errors.length).to.eql(1);
            expect(err.errors[0].path).to.eql('templateId');
            done();
          });
        });
      });

      it('ensures templateId belongs to an existing template', function (done) {
        factory.create('Job', function (err, job) {
          expect(err).to.not.exist;
          expect(job.getTemplate()).to.exist;

          job.validate().then(function (err) {
            expect(err).to.not.exist;
          }).then(function () {
            job.templateId = -1;
          }).then(function () {
            job.validate().then(function (err) {
              expect(err).to.exist;
              expect(err.errors.length).to.eql(1);
              expect(err.errors[0].path).to.eql('templateId');
              done();
            });
          });
        });
      });
    });

    describe('.state', function () {
      it('may not be empty', function (done) {
        var values = {state: ''};

        factory.build('Job', values, function (err, job) {
          expect(err).to.not.exist;
          expect(job.state).to.eql(values.state);

          job.validate().then(function (err) {
            expect(err).to.exist;
            expect(err.errors.length).to.eql(1);
            expect(err.errors[0].path).to.eql('state');
            done();
          });
        });
      });
    });

    describe('.format', function () {
      it('may not be empty', function (done) {
        var values = {format: ''};

        factory.build('Job', values, function (err, job) {
          expect(err).to.not.exist;
          expect(job.format).to.eql(values.format);

          job.validate().then(function (err) {
            expect(err).to.exist;
            expect(err.errors.length).to.eql(1);
            expect(err.errors[0].path).to.eql('format');
            done();
          });
        });
      });
    });
  });

  describe('instance methods', function () {
    describe('toPublicObject', function () {
      it('is a function', function () {
        factory.build('Job', function (err, job) {
          expect(job.toPublicObject).to.be.a('function');
        });
      });

      it('checks that result column does not exist', function (done) {
        factory.build('Job', function (err, job) {
          var publicJob = job.toPublicObject();
          expect(publicJob.result).to.not.exist;
          done();
        });
      });
    });

    describe('schedule()', function () {
      it('schedules a "convert" worker job on the given queue', function (done) {
        factory.create('Job', function (err, job) {
          expect(err).to.not.exist;

          job.schedule(queue, function errorHandler(err, j) {
            expect(err).to.not.exist;

            expect(queue.testMode.jobs).to.be.length(1);
            expect(queue.testMode.jobs[0].type).to.eql('convert');
            expect(queue.testMode.jobs[0].data).to.eql({jobId: job.id});

            done();
          });
        });
      });

      it('throws an error if the callback or queue is missing', function (done) {
        var noop = function () { };

        factory.create('Job', function (err, job) {
          expect(function () { job.schedule({}, null); }).to.throw(Error);
          expect(function () { job.schedule(null, noop); }).to.throw(Error);
          done();
        });
      });
    });
  });
});
