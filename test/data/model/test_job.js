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
var Job = require('../../..').data.model.Job;
var expect = require('chai').expect;

describe('gendok.data.model.job', function () {
  var factory = helper.loadFactories(this);

  it('is a function', function () {
    expect(Job).to.be.a('function');
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

  describe('validation', function() {
    describe('.templateId', function() {
      it('may not be empty', function() {
        var values = {templateId: ''};

        factory.build('Job', values, function (err, job) {
          expect(err).to.not.exist;
          expect(job.templateId).to.eql(values.templateId);

          job.validate().then(function (err) {
            expect(err).to.exist;
            expect(err.errors.length).to.eql(1);
            expect(err.errors[0].path).to.eql('templateId');
          });
        });
      });

      it('may not be undefined', function() {
        var values = {templateId: undefined};

        factory.build('Job', values, function (err, job) {
          expect(err).to.not.exist;
          expect(job.templateId).to.eql(values.templateId);

          job.validate().then(function (err) {
            expect(err).to.exist;
            expect(err.errors.length).to.eql(1);
            expect(err.errors[0].path).to.eql('templateId');
          });
        });
      });

      it('ensures templateId belongs to an existing template', function() {
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
            });
          });
        });
      });
    });
    describe('.state', function () {
      it('may not be empty', function() {
        var values = {state: ''};

        factory.build('Job', values, function (err, job) {
          expect(err).to.not.exist;
          expect(job.state).to.eql(values.state);

          job.validate().then(function (err) {
            expect(err).to.exist;
            expect(err.errors.length).to.eql(1);
            expect(err.errors[0].path).to.eql('state');
          });
        });
      });

      it('may not be undefined', function() {
        var values = {state: undefined};

        factory.build('Job', values, function (err, job) {
          expect(err).to.not.exist;
          expect(job.state).to.eql(values.state);

          job.validate().then(function (err) {
            expect(err).to.exist;
            expect(err.errors.length).to.eql(1);
            expect(err.errors[0].path).to.eql('state');
          });
        });
      });
    });
  });
});
