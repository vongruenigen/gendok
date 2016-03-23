/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var gendokHttp = require('../../..').http;
var templatesApi = gendokHttp.api.templates;
var basicMiddleware = gendokHttp.middleware.basic;
var Template = require('../../..').data.model.template;
var Config = require('../../..').config;
var expect = require('chai').expect;
var helper = require('../../helper');
var request = require('superagent');

describe('gendok.http.api.templates', function () {
  it('is a function', function () {
    expect(templatesApi).to.be.a('function');
  });

  var factory = helper.loadFactories(this);
  helper.runHttpServer(this, [basicMiddleware, templatesApi]);

  describe('POST /api/templates/', function () {
    it('creates a template in the database', function (done) {
      factory.build('Template', function (err, templ) {
        request.post('/api/templates')
               .send(templ.toJSON())
               .set('Content-Type', 'application/json')
               .end(function (err, res) {
                   expect(err).to.not.exist;
                   expect(res.statusCode).to.eql(201);

                   var createdAttrs = JSON.parse(res.body);

                   Template.findById(createdAttrs.id).then(function (err, templ) {
                     expect(err).to.not.exist;
                     expect(templ.id).to.eql(createdAttrs.id);
                     done();
                   });
               });
      });
    });
    it('returns the created template as JSON object', function () {

    });
    it('returns an error if an invalid template is posted', function () {

    });
  });

  describe('DELETE /api/templates/', function () {
    it('delete a template in the database', function (done) {
      factory.create('Template', function (err, templ) {
        request.delete('api/templates/' + templ.id)
          .end(function (err, res) {
            expect(err).to.not.exist;
            expect(res.statusCode).to.eql(200);

            Template.findById(templ.id).then(function (t) {
              expect(t).to.not.exist;
            });
          });
      });
    });
  });
});
