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
var users = gendokHttp.api.users;
var all = gendokHttp.middleware.all;
var errors = gendokHttp.api.errors;
var db = require('../../..').data.db;
var expect = require('chai').expect;
var helper = require('../../helper');
var request = require('superagent');
var simple = require('simple-mock');
var format = require('util').format;

describe('gendok.http.api.users', function () {
  var factory = helper.loadFactories(this);
  var server = helper.runHttpServer(this, [all, users]);
  var config = server.getConfig();
  var url = format('%s:%d/api/users',
                  config.get('http_host'), config.get('http_port'));
  var User = null;

  beforeEach(function () {
    User = db.getModel('User');
  });

  it('is a function', function () {
    expect(users).to.be.a('function');
  });

  describe('POST /api/users/', function () {
    it('creates a user in the database', function (done) {
      factory.create('User', {isAdmin: true}, function (err, creator) {
        factory.build('User', function (err, user) {
          request.post(url)
                 .send(user.toJSON())
                 .set('Content-Type', 'application/json')
                 .set('Authorization', 'Token ' + creator.apiToken)
                 .end(function (err, res) {
                   expect(err).to.not.exist;
                   expect(res.statusCode).to.eql(201);

                   var returnedAttrs = res.body;
                   expect(returnedAttrs.name).to.eql(user.name);
                   expect(returnedAttrs.email).to.eql(user.email);
                   done();
                 });
        });
      });
    });

    it('returns an error if an invalid user is posted', function (done) {
      factory.create('User', {isAdmin: true}, function (err, creator) {
        var values = {email: ''};
        factory.build('User', values, function (err, user) {
          request.post(url)
                 .send(user.toJSON())
                 .set('Content-Type', 'application/json')
                 .set('Authorization', 'Token ' + creator.apiToken)
                 .end(function (err, res) {
                   expect(err).to.exist;
                   expect(res.statusCode).to.eql(400);
                   expect(res.body).to.eql(errors.badRequest.data);
                   done();
                 });
        });
      });
    });

    it('returns the created user as JSON object', function (done) {
      factory.create('User', {isAdmin: true}, function (err, creator) {
        factory.build('User', function (err, user) {
          request.post(url)
                 .send(user.toJSON())
                 .set('Content-Type', 'application/json')
                 .set('Authorization', 'Token ' + creator.apiToken)
                 .end(function (err, res) {
                   expect(err).to.not.exist;
                   expect(res.statusCode).to.eql(201);

                   var returnedAttrs = res.body;

                   //expect(returnedAttrs.isAdmin).to.eql(user.isAdmin);
                   expect(returnedAttrs.name).to.eql(user.name);
                   expect(returnedAttrs.email).to.eql(user.email);
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

    it('returns an unauthorized error if the specified user is not an admin', function (done) {
      factory.create('User', function (err, user) {
        request.get(url + '/123456')
               .set('Authorization', 'Token ' + user.apiToken)
               .end(function (err, res) {
                 expect(err).to.exist;
                 expect(res.statusCode).to.eql(errors.unauthorized.code);
                 expect(res.body).to.eql(errors.unauthorized.data);
                 done();
               });
      });
    });
  });

  describe('GET /api/users/:id', function () {
    it('the specified user as a JSON object', function (done) {
      factory.create('User', {isAdmin: true}, function (err, creator) {
        factory.create('User', function (err, user) {
          request.get(url + '/' + user.id)
                 .set('Authorization', 'Token ' + creator.apiToken)
                 .end(function (err, res) {
                   expect(err).to.not.exist;
                   expect(res.statusCode).to.eql(200);
                   expect(res.body).to.deep.equal(user.toPublicObject());
                   done();
                 });
        });
      });
    });

    it('returns a 404 if the specified user does not exist', function (done) {
      factory.create('User', {isAdmin: true}, function (err, user) {
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

    it('returns an unauthorized error if the specified user is not an admin', function (done) {
      factory.create('User', function (err, user) {
        request.get(url + '/123456')
               .set('Authorization', 'Token ' + user.apiToken)
               .end(function (err, res) {
                 expect(err).to.exist;
                 expect(res.statusCode).to.eql(errors.unauthorized.code);
                 expect(res.body).to.eql(errors.unauthorized.data);
                 done();
               });
      });
    });
  });

  describe('PUT /api/users/:id', function () {
    it('update a user in the database', function (done) {
      factory.create('User', {isAdmin: true}, function (err, user) {
        var attrs = {name: 'gendok'};
        request.put(url + '/' + user.id)
              .send(attrs)
              .set('Content-Type', 'application/json')
              .set('Authorization', 'Token ' + user.apiToken)
              .end(function (err, res) {
                expect(err).to.not.exist;
                expect(res.statusCode).to.eql(200);
                user.reload().then(function (dbUser) {
                  expect(dbUser.body).to.eql(attrs.body);
                  done();
                });
              });
      });
    });

    it('returns an error, no update if validation fails', function (done) {
      factory.create('User', {isAdmin: true}, function (err, user) {
        var attrs = {name: ''};

        request.put(url + '/' + (user.id))
              .send(attrs)
              .set('Content-Type', 'application/json')
              .set('Authorization', 'Token ' + user.apiToken)
              .end(function (err, res) {
                expect(err).to.exist;
                expect(res.statusCode).to.eql(400);
                expect(res.body).to.eql(errors.badRequest.data);
                user.reload().then(function (dbUser) {
                  expect(dbUser.body).to.eql(user.body);
                  expect(dbUser.type).to.eql(user.type);
                  done();
                });
              });
      });
    });

    it('returns an error, no update if user id not found in DB', function (done) {
      factory.create('User', {isAdmin: true}, function (err, user) {
        request.put(url + '/' + (user.id + 1000))
              .send({})
              .set('Content-Type', 'application/json')
              .set('Authorization', 'Token ' + user.apiToken)
              .end(function (err, res) {
                expect(err).to.exist;
                expect(res.statusCode).to.eql(404);
                expect(res.body).to.eql(errors.notFound.data);
                user.reload().then(function (dbUser) {
                  expect(dbUser.body).to.eql(user.body);
                  expect(dbUser.type).to.eql(user.type);
                  done();
                });
              });
      });
    });

    it('returns an unauthorized error without a valid api token', function (done) {
      factory.create('User', {isAdmin: true}, function (err, user) {
        request.put(url)
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

  describe('DELETE /api/users/:id', function () {
    it('deletes a user in the database', function (done) {
      factory.create('User', {isAdmin: true}, function (err, user) {
        request.delete(url + '/' + user.id)
               .set('Content-Type', 'application/json')
               .set('Authorization', 'Token ' + user.apiToken)
               .end(function (err, res) {
                 expect(err).to.not.exist;
                 expect(res.statusCode).to.eql(200);
                 User.findById(user.id).then(function (user) {
                   expect(user).to.not.exist;
                   done();
                 });
               });
      });
    });

    it('returns a 404 if no user with the given id exists', function (done) {
      factory.create('User', {isAdmin: true}, function (err, user) {
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

    it('returns a 400 if invalid id is given', function (done) {
      factory.create('User', {isAdmin: true}, function (err, user) {
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

    it('returns an unauthorized error without a valid api token', function (done) {
      factory.create('User', function (err, user) {
        request.delete(url + '/' + user.id)
               .set('Authorization', 'Token blubiblub')
               .end(function (err, res) {
                 expect(err).to.exist;
                 expect(res.statusCode).to.eql(errors.unauthorized.code);
                 expect(res.body).to.eql(errors.unauthorized.data);
                 done();
               });
      });
    });

    it('delete user template and job', function (done) {
      var Template = db.getModel('Template');
      var Job = db.getModel('Job');

      factory.create('User', {isAdmin: true}, function (err, user) {
        factory.create('Template', {userId: user.id}, function (err, template) {
          factory.create('Job', {templateId: template.id}, function (err, job) {
            request.delete(url + '/' + user.id)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Token ' + user.apiToken)
                    .end(function (err, res) {
                      expect(res.statusCode).to.eql(200);

                      User.findById(user.id).then(function (dbUser) {
                        expect(dbUser).to.not.exist;

                        Template.findById(template.id).then(function (dbTemplate) {
                           expect(dbTemplate).to.not.exist;

                           Job.findById(job.id).then(function (dbJob) {
                              expect(dbJob).to.not.exist;
                              done();
                            });
                         });
                      });
                    });
          });
        });
      });
    });
  });
});
