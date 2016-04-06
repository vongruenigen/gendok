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
var jobs = gendokHttp.api.jobs;
var all = gendokHttp.middleware.all;
var errors = gendokHttp.api.errors;
var db = require('../../..').data.db;
var Template = require('../../..').data.model.Template;
var expect = require('chai').expect;
var helper = require('../../helper');
var request = require('superagent');

describe('gendok.http.api.jobs', function () {
  var factory = helper.loadFactories(this);
  var server = helper.runHttpServer(this, [all, jobs]);
  var url = helper.getUrl('/api/jobs');
  var Template = null;
  var Job = null;

  beforeEach(function () {
    Template = db.getModel('Template');
  });

  beforeEach(function () {
    Job = db.getModel('Job');
  });

  it('is a function', function () {
    expect(jobs).to.be.a('function');
  });

  describe('GET /api/jobs/:id', function () {
    var jobUrl = url + '/:id';

    it('returns the state of the given job', function (done) {
      factory.create('Template', function (err, template) {
        template.getUser().then(function (user) {
          factory.create('Job', {templateId: template.id}, function (err, job) {
            request.get(jobUrl.replace(':id', job.id))
                   .set('Authorization', 'Token ' + user.apiToken)
                   .end(function (err, res) {
                     expect(err).to.not.exist;
                     expect(res.statusCode).to.eql(200);

                     var returnedAttrs = res.body;

                     expect(returnedAttrs.id).to.eql(job.id);
                     expect(returnedAttrs.templateId).to.eql(template.id);
                     expect(returnedAttrs.payload).not.to.eql(null);
                     expect(returnedAttrs.state).not.to.eql(null);
                     done();
                   });
          });
        });
      });
    });

    it('returns an error if an invalid jobId is posted', function (done) {
      factory.create('Template', function (err, template) {
        template.getUser().then(function (user) {
          factory.create('Job', {templateId: template.id}, function (err, job) {
            request.get(jobUrl.replace(':id', '1234565'))
                   .set('Authorization', 'Token ' + user.apiToken)
                   .end(function (err, res) {
                     expect(err).to.exist;
                     expect(res.statusCode).to.eql(errors.notFound.code);
                     expect(res.body).to.eql(errors.notFound.data);
                     done();
                   });
          });
        });
      });
    });

    it('returns an unauthorized error without a valid api token', function (done) {
      request.get(jobUrl.replace(':id', '1'))
             .set('Authorization', 'Token blubiblub')
             .end(function (err, res) {
               expect(err).to.exist;
               expect(res.statusCode).to.eql(errors.unauthorized.code);
               expect(res.body).to.eql(errors.unauthorized.data);
               done();
             });
    });
  });

  describe('GET /api/jobs/:id/download', function () {
    var downloadUrl = url + '/:id/download';

    it('returns the resulting pdf of the given job', function (done) {
      factory.create('Template', function (err, template) {
        template.getUser().then(function (user) {
          var attrs = {
            templateId: template.id,
            result: 'Hello world from gendok!',
            state: 'finished'
          };

          factory.create('Job', attrs, function (err, job) {
            request.get(downloadUrl.replace(':id', job.id))
                   .set('Authorization', 'Token ' + user.apiToken)
                   .buffer()
                   .end(function (err, res) {
                     expect(err).not.to.exist;
                     expect(res.statusCode).to.eql(200);
                     expect(res.get('Content-Type')).to.eql('application/pdf');
                     expect(res.text).to.eql(attrs.result);
                     done();
                   });
          });
        });
      });

      it('returns an unauthorized error without a valid api token', function (done) {
        request.post(downloadUrl.replace(':id', '1'))
               .set('Authorization', 'Token blubiblub')
               .end(function (err, res) {
                 expect(err).to.exist;
                 expect(res.statusCode).to.eql(errors.unauthorized.code);
                 expect(res.body).to.eql(errors.unauthorized.data);
                 done();
               });
      });
    });

    it('returns an error if the job state is not finished', function (done) {
      factory.create('Template', function (err, template) {
        template.getUser().then(function (user) {
          factory.create('Job', {templateId: template.id}, function (err, job) {
            request.get(downloadUrl.replace(':id', job.id))
                   .set('Authorization', 'Token ' + user.apiToken)
                   .end(function (err, res) {
                     expect(err).to.exist;
                     expect(res.statusCode).to.eql(errors.forbidden.code);
                     done();
                   });
          });
        });
      });
    });

    it('returns an error if an invalid jobId is given', function (done) {
      factory.create('Template', function (err, template) {
        template.getUser().then(function (user) {
          factory.create('Job', {templateId: template.id}, function (err, job) {
            request.get(downloadUrl.replace(':id', '123456'))
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

    it('returns an unauthorized error without a valid api token', function (done) {
      request.get(downloadUrl.replace(':id', '1'))
             .set('Authorization', 'Token blubiblub')
             .end(function (err, res) {
               expect(err).to.exist;
               expect(res.statusCode).to.eql(errors.unauthorized.code);
               expect(res.body).to.eql(errors.unauthorized.data);
               done();
             });
    });
  });
});
