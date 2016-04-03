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
        var queueJob = { save: simple.stub().callbackWith(null) };
        var queue = { create: simple.stub().returnWith(queueJob) };

        factory.create('Job', function (err, job) {
          expect(err).to.not.exist;

          job.schedule(queue, function errorHandler(err, j) {
            expect(err).to.not.exist;
            expect(j).to.eql(queueJob);

            // Check calls on create() stub
            expect(queue.create.callCount).to.eql(1);
            expect(queue.create.lastCall.args[0]).to.eql('convert');
            expect(queue.create.lastCall.args[1]).to.eql({jobId: job.id});

            // Check calls on save() stub
            expect(queueJob.save.callCount).to.eql(1);
            expect(queueJob.save.lastCall.arg).to.be.a('function');

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
