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

      it('returns all properties', function (done) {
        factory.build('Job', function (err, job) {
          var publicJob = job.toPublicObject();
          expect(publicJob.templateId).to.exist;
          expect(publicJob.payload).to.exist;
          expect(publicJob.state).to.exist;
          expect(publicJob.result).to.be.null;
          done();
        });
      });
    });
  });
});
