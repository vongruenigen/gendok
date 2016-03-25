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
var authMiddleware = gendokHttp.middleware.authorization;
var errors = gendokHttp.api.errors;
var db = require('../../..').data.db;
var User = require('../../..').data.model.user;
var expect = require('chai').expect;
var helper = require('../../helper');
var request = require('superagent');
var format = require('util').format;

describe('gendok.http.api.templates', function () {
  var factory = helper.loadFactories(this);
  var middleware = [basicMiddleware, authMiddleware, templatesApi];
  var server = helper.runHttpServer(this, middleware);
  var config = server.getConfig();
  var url = format('%s:%d/api/templates',
                  config.get('http_host'), config.get('http_port'));
  var Template = null;

  beforeEach(function () {
    Template = db.getModel('Template');
  });

  it('is a function', function () {
    expect(templatesApi).to.be.a('function');
  });

  describe('POST /api/templates/', function () {
    it('creates a template in the database', function (done) {
      factory.create('User', function (err, user) {
        factory.build('Template', function (err, templ) {
          request.post(url)
                .send(templ.toJSON())
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Token ' + user.apiToken)
                .end(function (err, res) {
                  expect(err).to.not.exist;
                  expect(res.statusCode).to.eql(201);

                  var returnedAttrs = res.body;

                  Template.findById(returnedAttrs.id).then(function (dbTempl) {
                    expect(dbTempl.id).to.eql(returnedAttrs.id);
                    expect(dbTempl.body).to.eql(templ.body);
                    expect(dbTempl.type).to.eql(templ.type);
                    expect(dbTempl.userId).to.eql(user.id);
                    done();
                  });
                });
        });
      });
    });

    it('returns the created template as JSON object', function (done) {
      factory.create('User', function (err, user) {
        factory.build('Template', function (err, templ) {
          request.post(url)
            .send(templ.toJSON())
            .set('Content-Type', 'application/json')
            .set('Authorization', 'Token ' + user.apiToken)
            .end(function (err, res) {
              expect(err).to.not.exist;
              expect(res.statusCode).to.eql(201);

              var returnedAttrs = res.body;

              expect(returnedAttrs.type).to.eql(templ.type);
              expect(returnedAttrs.body).to.eql(templ.body);
              expect(returnedAttrs.id).not.to.eql(null);
              done();
            });
        });
      });
    });

    it('returns an error if an invalid template is posted', function (done) {
      factory.create('User', function (err, user) {
        var values = {type: ''};
        factory.build('Template', values, function (err, templ) {
          request.post(url)
            .send(templ.toJSON())
            .set('Content-Type', 'application/json')
            .set('Authorization', 'Token ' + user.apiToken)
            .end(function (err, res) {
              expect(err).to.exist;
              expect(res.statusCode).to.eql(400);
              expect(res.body).to.eql(errors.badRequest.data);
              done();
            });
        });
      });
    });
  });

  describe('DELETE /api/templates/', function () {
    it('delete a template in the database', function (done) {
      factory.create('User', function (err, user) {
        factory.create('Template', {userId: user.id}, function (err, templ) {
          request.delete(url + '/' + templ.id)
            .set('Content-Type', 'application/json')
            .set('Authorization', 'Token ' + user.apiToken)
            .end(function (err, res) {
              expect(err).to.not.exist;
              expect(res.statusCode).to.eql(200);
              Template.findById(templ.id).then(function (t) {
                expect(t).to.not.exist;
                done();
              });
            });
        });
      });
    });
  });
});
