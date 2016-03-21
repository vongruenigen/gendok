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
var Template = require('../../..').data.model.Template;
var expect = require('chai').expect;

describe('gendok.data.model.template', function () {
  var factory = helper.loadFactories(this);

  it('is a function', function () {
    expect(Template).to.be.a('function');
  });

  describe('the factory', function () {
    it('inserts a template into the db', function (done) {
      factory.create('Template', function (err, template) {
        expect(err).to.not.exist;
        expect(template).to.exist;
        done();
      });
    });
  });

  describe('validation', function () {
    describe('.type', function () {
      it('may not be empty', function () {
        var values = {type: ''};

        factory.build('Template', values, function (err, template) {
          expect(err).to.not.exist;
          expect(template.type).to.eql(values.type);

          template.validate().then(function (err) {
            console.log(err);
            expect(err).to.exist;
            expect(err.errors.length).to.eql(1);
            expect(err.errors[0].path).to.eql('type');
          });
        });
      });

      it('may not be undefined', function () {
        var values = {type: undefined};

        factory.build('Template', values, function (err, template) {
           expect(err).to.not.exist;
           expect(template.type).to.eql(values.type);

           template.validate().then(function (err) {
             expect(err).to.exist;
             expect(err.errors.length).to.eql(1);
             expect(err.errors[0].path).to.eql('type');
           });
        });
      });
    });

    describe('.body', function () {
      it('may not be empty', function () {
        var values = {body: ''};

        factory.build('Template', values, function (err, template) {
           expect(err).to.not.exist;
           expect(template.body).to.eql(values.body);

           template.validate().then(function (err) {
             expect(err).to.exist;
             expect(err.errors.length).to.eql(1);
             expect(err.errors[0].path).to.eql('body');
           });
        });
      });
      it('may not be undefined', function () {
        var values = {body: undefined};

        factory.build('Template', values, function (err, template) {
           expect(err).to.not.exist;
           expect(template.body).to.eql(values.body);
           template.validate().then(function (err) {
             expect(err).to.exist;
             expect(err.errors.length).to.eql(1);
             expect(err.errors[0].path).to.eql('body');
           });
        });
      });
    });

    describe('.userId', function () {
      it('may not be undefined', function () {
        var values = {userId: undefined};

        factory.build('Template', values, function (err, template) {
          expect(err).to.not.exist;
          expect(template.userId).to.eql(values.userId);

          template.validate().then(function (err) {
            expect(err).to.exist;
            expect(err.errors.length).to.eql(1);
            expect(err.errors[0].path).to.eql('userId');
          });
        });
      });
      it('ensures userId is an existing user', function () {
        factory.create('Template', function (err, template) {
          expect(err).to.not.exist;
          expect(template.getUser()).to.exist;

          template.validate().then(function (err) {
            expect(err).to.not.exist;
          }).then(function () {
            template.userId = -1;
          }).then(function () {
            template.validate().then(function (err) {
              expect(err).to.exist;
              expect(err.errors.length).to.eql(1);
              expect(err.errors[0].path).to.eql('userId');
            });
          });
        });
      });
    });
  });
});
