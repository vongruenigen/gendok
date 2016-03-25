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
var templates = gendokHttp.api.templates;
var all = gendokHttp.middleware.all;
var errors = gendokHttp.api.errors;
var db = require('../../..').data.db;
var expect = require('chai').expect;
var helper = require('../../helper');
var request = require('superagent');
var format = require('util').format;

describe('gendok.http.api.templates', function () {
  var factory = helper.loadFactories(this);
  var server = helper.runHttpServer(this, [all, templates]);
  var config = server.getConfig();
  var url = format('%s:%d/api/templates',
                  config.get('http_host'), config.get('http_port'));
  var Template = null;

  beforeEach(function () {
    Template = db.getModel('Template');
  });

  it('is a function', function () {
    expect(templates).to.be.a('function');
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

  describe('PUT /api/templates/:id', function () {
    it('update a template in the database', function (done) {
      factory.create('User', function (err, user) {
        factory.create('Template', function (err, tmpl) {
          var attrs = {body: 'content'};

          request.put(url + '/' + tmpl.id)
                .send(attrs)
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Token ' + user.apiToken)
                .end(function (err, res) {
                  expect(err).to.not.exist;
                  expect(res.statusCode).to.eql(200);

                  tmpl.reload().then(function (dbTempl) {
                    expect(dbTempl.body).to.eql(attrs.body);
                    done();
                  });
                });
        });
      });
    });

    it('returns an error, no update if template id not found in DB', function (done) {
      factory.create('User', function (err, user) {
        factory.create('Template', function (err, tmpl) {
          request.put(url + '/' + (tmpl.id + 1000))
                .send({})
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Token ' + user.apiToken)
                .end(function (err, res) {
                  expect(err).to.exist;
                  expect(res.statusCode).to.eql(404);
                  expect(res.body).to.eql(errors.notFound.data);
                  tmpl.reload().then(function (dbTempl) {
                    expect(dbTempl.body).to.eql(tmpl.body);
                    expect(dbTempl.type).to.eql(tmpl.type);
                    done();
                  });
                });
        });
      });
    });

    it('returns an error, no update if template content type is not supported', function (done) {
      factory.create('User', function (err, user) {
        factory.create('Template', function (err, tmpl) {
          var attrs = {type: 'nonsense'};

          request.put(url + '/' + (tmpl.id))
                .send(attrs)
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Token ' + user.apiToken)
                .end(function (err, res) {
                  expect(err).to.exist;
                  expect(res.statusCode).to.eql(400);
                  expect(res.body).to.eql(errors.badRequest.data);
                  tmpl.reload().then(function (dbTempl) {
                    expect(dbTempl.body).to.eql(tmpl.body);
                    expect(dbTempl.type).to.eql(tmpl.type);
                    done();
                  });
                });
        });
      });
    });
  });
});
