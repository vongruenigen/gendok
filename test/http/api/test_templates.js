/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var gendok = require('../../..');
var templates = gendok.http.api.templates;
var all = gendok.http.middleware.all;
var errors = gendok.http.api.errors;
var util = require('../../..').util;
var db = require('../../..').data.db;
var expect = require('chai').expect;
var helper = require('../../helper');
var request = require('superagent');
var simple = require('simple-mock');

describe('gendok.http.api.templates', function () {
  var factory = helper.loadFactories(this);
  var queue = util.createQueue();
  var server = helper.runHttpServer(this, [all, templates]);

  var url = helper.getUrl('/api/templates');
  var Template = null;
  var Job = null;

  beforeEach(function () {
    Job = db.getModel('Job');
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
                   expect(res.statusCode).to.eql(errors.validation.code);

                   Template.create(templ.toJSON()).catch(function (err) {
                     var expectedError = errors.validation.data(err);
                     expect(res.body).to.eql(expectedError);
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

    it('returns an unauthorized error without a valid api token', function (done) {
      request.post(url)
             .set('Authorization', 'Token blubiblub')
             .end(function (err, res) {
               expect(err).to.exist;
               expect(res.statusCode).to.eql(errors.unauthorized.code);
               expect(res.body).to.eql(errors.unauthorized.data);
               done();
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

    it('returns an error, no update if validation fails', function (done) {
      factory.create('User', function (err, user) {
        factory.create('Template', function (err, tmpl) {
          var attrs = {type: 'nonsense'};

          request.put(url + '/' + (tmpl.id))
                .send(attrs)
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Token ' + user.apiToken)
                .end(function (err, res) {
                  expect(err).to.exist;
                  expect(res.statusCode).to.eql(errors.validation.code);

                  tmpl.update(attrs).catch(function (err) {
                    var expectedError = errors.validation.data(err);
                    expect(res.body).to.eql(expectedError);
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

    it('returns an unauthorized error without a valid api token', function (done) {
      factory.create('Template', function (err, tmpl) {
        request.post(url)
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

  describe('DELETE /api/templates/:id', function () {
    it('deletes a template in the database', function (done) {
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

    it('returns a 404 if no template with the given id exists', function (done) {
      factory.create('User', function (err, user) {
        factory.create('Template', {userId: user.id}, function (err, templ) {
          request.delete(url + '/123456789')
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

    it('returns a 400 if invalid id is given', function (done) {
      factory.create('User', function (err, user) {
        factory.create('Template', {userId: user.id}, function (err, templ) {
          request.delete(url + '/' + 'blub')
                 .set('Authorization', 'Token ' + user.apiToken)
                 .end(function (err, res) {
                   expect(err).to.exist;
                   expect(res.statusCode).to.eql(errors.badRequest.code);
                   expect(res.body).to.eql(errors.badRequest.data);
                   done();
                 });
        });
      });
    });

    it('returns an unauthorized error without a valid api token', function (done) {
      factory.create('Template', function (err, tmpl) {
        request.delete(url + '/' + tmpl.id)
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

  describe('POST /api/templates/:id/render', function () {
    var renderUrl = url + '/:id/render';

    it('creates a job in the database', function (done) {
      var payload = {gugus: 'blub'};

      factory.create('Template', function (err, template) {
        template.getUser().then(function (user) {
          request.post(renderUrl.replace(':id', template.id))
                 .send(payload)
                 .set('Content-Type', 'application/json')
                 .set('Authorization', 'Token ' + user.apiToken)
                 .end(function (err, res) {
                   expect(err).to.not.exist;
                   expect(res.statusCode).to.eql(201);

                   Job.findById(res.body.id).then(function (job) {
                     expect(job.templateId).to.eql(res.body.templateId);
                     expect(job.payload).to.eql(res.body.payload);
                     expect(job.state).to.eql(res.body.state);
                     done();
                   });
                 });
        });
      });
    });

    it('schedules job for the worker', function (done) {
      var payload = {gugus: 'blub'};

      factory.create('Template', function (err, template) {
        template.getUser().then(function (user) {
          queue.on('job enqueue', function (id, type) {
            expect(type).to.eql('convert');
          });

          request.post(renderUrl.replace(':id', template.id))
                 .send(payload)
                 .set('Content-Type', 'application/json')
                 .set('Authorization', 'Token ' + user.apiToken)
                 .end(function (err, res) {
                   expect(err).to.not.exist;
                   expect(res.statusCode).to.eql(201);
                   done();
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
          request.post(renderUrl.replace(':id', 'blub'))
                 .send(payload)
                 .set('Content-Type', 'application/json')
                 .set('Authorization', 'Token ' + user.apiToken)
                 .end(function (err, res) {
                   expect(err).to.exist;
                   expect(res.statusCode).to.eql(errors.badRequest.code);
                   expect(res.body).to.eql(errors.badRequest.data);
                   done();
                 });
        });
      });
    });

    it('returns a 404 for a inexistent template id', function (done) {
      var payload = {gugus: 'blub'};

      factory.create('Template', function (err, template) {
        template.getUser().then(function (user) {
          request.post(renderUrl.replace(':id', '1234567890'))
                 .send(payload)
                 .set('Content-Type', 'application/json')
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

    it('returns an unauthorized error without a valid api token', function (done) {
      factory.create('Template', function (err, tmpl) {
        request.post(renderUrl.replace(':id', tmpl.id))
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

  describe('GET /api/templates/', function () {
    it('returns all templates of the user as JSON objects', function (done) {
      factory.create('User', function (err, user) {
        factory.createMany('Template', {userId: user.id}, 3, function (err, templs) {
          var createdTemplates = [];
          templs.forEach(function (template) {
            createdTemplates.push(template.toPublicObject());
          });

          request.get(url)
                 .set('Authorization', 'Token ' + user.apiToken)
                 .end(function (err, res) {
                   expect(err).to.not.exist;
                   expect(res.body).to.deep.equal(createdTemplates);
                   done();
                 });
        });
      });
    });

    it('returns an empty array if there aren\'t any templates for the given user', function (done) {
      factory.create('User', function (err, user) {
        request.get(url)
               .set('Authorization', 'Token ' + user.apiToken)
               .end(function (err, res) {
                 expect(err).to.not.exist;
                 expect(res.body).to.eql([]);
                 done();
               });
      });
    });

    it('returns an unauthorized error without a valid api token', function (done) {
      factory.create('Template', function (err, tmpl) {
        request.post(url)
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

  describe('GET /api/templates/:id', function () {
    it('the specified template as a JSON object', function (done) {
      factory.create('User', function (err, user) {
        factory.create('Template', {userId: user.id}, function (err, tmpl) {
          request.get(url + '/' + tmpl.id)
                 .set('Authorization', 'Token ' + user.apiToken)
                 .end(function (err, res) {
                   expect(err).to.not.exist;
                   expect(res.body).to.deep.equal(tmpl.toPublicObject());
                   done();
                 });
        });
      });
    });

    it('returns a 404 if the specified template doesnt exist', function (done) {
      factory.create('User', function (err, user) {
        request.get(url + '/123456')
               .set('Authorization', 'Token ' + user.apiToken)
               .end(function (err, res) {
                 expect(err).to.exist;
                 expect(res.statusCode).to.eql(errors.notFound.code);
                 expect(res.body).to.eql(errors.notFound.data);
                 done();
               });
      });
    });

    it('returns an unauthorized error without a valid api token', function (done) {
      request.get(url + '/12345')
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
