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
  var Job = null;

  beforeEach(function () {
    Template = db.getModel('Template');
  });

  beforeEach(function () {
    Job = db.getModel('Job');
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

  describe('POST /api/templates/:id/render', function () {
    var renderUrl = url + '/:id/render';

    it('creates a job in the database', function (done) {
      var payload = {gugus: 'blub'};

      factory.create('Template', function (err, template) {
        template.getUser().then(function (user) {
          factory.build('Job', {templateId: template.id}, function (err, job) {
            request.post(renderUrl.replace(':id', template.id))
                   .send(payload)
                   .set('Content-Type', 'application/json')
                   .set('Authorization', 'Token ' + user.apiToken)
                   .end(function (err, res) {
                     expect(err).to.not.exist;
                     expect(res.statusCode).to.eql(201);

                     var returnedAttrs = res.body;

                     Job.findById(returnedAttrs.id).then(function (dbJob) {
                       expect(dbJob.templateId).to.eql(template.id);
                       expect(dbJob.payload).to.eql(payload);
                       expect(dbJob.state).to.eql('pending');
                       done();
                     });
                   });
          });
        });
      });
    });

    it('returns the created job as JSON', function (done) {
      var payload = {gugus: 'blub'};

      factory.create('Template', function (err, template) {
        template.getUser().then(function (user) {
          factory.build('Job', {templateId: template.id}, function (err, job) {
            request.post(renderUrl.replace(':id', template.id))
                   .send(payload)
                   .set('Content-Type', 'application/json')
                   .set('Authorization', 'Token ' + user.apiToken)
                   .end(function (err, res) {
                     expect(err).to.not.exist;
                     expect(res.statusCode).to.eql(201);

                     var returnedAttrs = res.body;

                     expect(returnedAttrs.id).not.to.eql(null);
                     expect(returnedAttrs.payload).to.eql(payload);
                     expect(returnedAttrs.state).to.eql('pending');
                     done();
                   });
          });
        });
      });
    });

    it('returns an error if an invalid templateId is posted', function (done) {
      var payload = {gugus: 'blub'};

      factory.create('Template', function (err, template) {
        template.getUser().then(function (user) {
          factory.build('Job', {templateId: template.id}, function (err, job) {
            request.post(renderUrl.replace(':id', ''))
                   .send(payload)
                   .set('Content-Type', 'application/json')
                   .set('Authorization', 'Token ' + user.apiToken)
                   .end(function (err, res) {
                     expect(err).to.exist;
                     expect(res.statusCode).to.eql(404);
                     done();
                   });
          });
        });
      });
    });
  });
});
