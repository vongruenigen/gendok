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
var User = require('../../..').data.model.user;
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
      factory.create('User', function (err, user) {
        factory.build('Template', values, function (err, templ) {
          request.post('/api/templates')
                .send(templ.toJSON())
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Token ' + user.apiToken)
                .end(function (err, res) {
                  expect(err).to.not.exist;
                  expect(res.statusCode).to.eql(201);

                  var createdAttrs = JSON.parse(res.body);
                  console.log(createdAttrs);

                  Template.findById(createdAttrs.id).then(function (err, templ) {
                    expect(err).to.not.exist;
                    expect(templ.id).to.eql(createdAttrs.id);
                    done();
                  });
                });
        });
      });
    });

    it('returns the created template as JSON object', function () {
      factory.build('Template', function (err, templ) {
        request.post('/api/templates')
          .send(templ.toJSON())
          .set('Content-Type', 'application/json')
          .end(function (err, res) {
            expect(err).to.not.exist;
            expect(res.statusCode).to.eql(201);

            var createdAttrs = JSON.parse(res.body);

            expect(createdAttrs.type).to.eql(templ.type);
            expect(createdAttrs.body).to.eql(templ.body);
            expect(createdAttrs.id).not.to.eql(null);
          });
      });
    });

    it('returns an error if an invalid template is posted', function () {
      var values = {type: ''};

      factory.build('Template', values, function (err, templ) {
        request.post('/api/templates')
          .send(templ.toJSON())
          .set('Content-Type', 'application/json')
          .end(function (err, res) {
            expect(err).to.not.exist;
            expect(res.statusCode).to.eql(400);
          });
      });
    });
  });
});
