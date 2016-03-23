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
      it('returns an error if an invalid compiler type is used', function () {
        factory.build('Template', function (err, tmpl) {
          expect(err).to.not.exist;
          expect(tmpl).to.exist;
          expect(tmpl.type).to.exist;

          tmpl.type = 'bogus';

          tmpl.validate().then(function (err) {
            expect(err).to.exist;
          });
        });
      });
    });
  })
});
