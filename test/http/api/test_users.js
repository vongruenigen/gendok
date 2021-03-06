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
  var url = helper.getUrl('/api/users');

  var User;
  var Template;
  var Job;

  beforeEach(function () {
    User = db.getModel('User');
    Template = db.getModel('Template');
    Job = db.getModel('Job');
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
                 .set('Authorization', 'Bearer ' + creator.apiToken)
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
                 .set('Authorization', 'Bearer ' + creator.apiToken)
                 .end(function (err, res) {
                   expect(err).to.exist;
                   expect(res.statusCode).to.eql(errors.validation.code);

                   User.create(user.toJSON()).catch(function (err) {
                     var expectedError = errors.validation.data(err);
                     expect(res.body).to.eql(expectedError);
                     done();
                   });
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
                 .set('Authorization', 'Bearer ' + creator.apiToken)
                 .end(function (err, res) {
                   expect(err).to.not.exist;
                   expect(res.statusCode).to.eql(201);

                   var returnedAttrs = res.body;

                   expect(returnedAttrs.isAdmin).to.eql(user.isAdmin);
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
               .set('Authorization', 'Bearer ' + user.apiToken)
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
                 .set('Authorization', 'Bearer ' + creator.apiToken)
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
               .set('Authorization', 'Bearer ' + user.apiToken)
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
               .set('Authorization', 'Bearer ' + user.apiToken)
               .end(function (err, res) {
                 expect(err).to.exist;
                 expect(res.statusCode).to.eql(errors.unauthorized.code);
                 expect(res.body).to.eql(errors.unauthorized.data);
                 done();
               });
      });
    });
  });

  describe('GET /api/users/', function () {
    it('returns all users of the user as JSON objects', function (done) {
      factory.create('User', {isAdmin: true}, function (err, user) {
        factory.createMany('User', 3, function (err, users) {
          var createdUsers = [user.toPublicObject()];
          users.forEach(function (u) {
            createdUsers.push(u.toPublicObject());
          });

          request.get(url)
                 .set('Authorization', 'Bearer ' + user.apiToken)
                 .end(function (err, res) {
                   expect(err).to.not.exist;

                   createdUsers.forEach(function (u) {
                     expect(res.body).to.include(u);
                   });

                   done();
                 });
        });
      });
    });

    it('returns an unauthorized error without a valid api token', function (done) {
      request.get(url + '/12345')
             .set('Authorization', 'Bearer blubiblub')
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
               .set('Authorization', 'Bearer ' + user.apiToken)
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
              .set('Authorization', 'Bearer ' + user.apiToken)
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
              .set('Authorization', 'Bearer ' + user.apiToken)
              .end(function (err, res) {
                expect(err).to.exist;
                expect(res.statusCode).to.eql(errors.validation.code);

                user.update(attrs).catch(function (err) {
                  var expectedError = errors.validation.data(err);
                  expect(res.body).to.eql(expectedError);
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
              .set('Authorization', 'Bearer ' + user.apiToken)
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

    it('updates the password in the database', function (done) {
      factory.create('User', {isAdmin: true}, function (err, user) {
        var attrs = {
          password: 'abc123456',
          passwordConfirmation: 'abc123456'
        };

        request.put(url + '/' + (user.id))
               .send(attrs)
               .set('Content-Type', 'application/json')
               .set('Authorization', 'Bearer ' + user.apiToken)
               .end(function (err, res) {
                 expect(err).to.not.exist;
                 expect(res.statusCode).to.eql(200);

                 user.reload().then(function (dbUser) {
                   expect(dbUser.isPassword(attrs.password)).to.be.true;
                   done();
                 });
               });
      });
    });

    it('it returns an error if the passwords do not match', function (done) {
      factory.create('User', {isAdmin: true}, function (err, user) {
        var attrs = {
          password: 'abc123456',
          passwordConfirmation: 'abc123457'
        };

        request.put(url + '/' + (user.id))
               .send(attrs)
               .set('Content-Type', 'application/json')
               .set('Authorization', 'Bearer ' + user.apiToken)
               .end(function (err, res) {
                 expect(err).to.exist;
                 expect(res.statusCode).to.eql(errors.validation.code);

                 user.update(attrs).catch(function (err) {
                   var expectedError = errors.validation.data(err);
                   expect(res.body).to.eql(expectedError);
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
      factory.create('User', {isAdmin: true}, function (err, admin) {
        factory.create('User', function (err, user) {
          request.delete(url + '/' + user.id)
                 .set('Content-Type', 'application/json')
                 .set('Authorization', 'Bearer ' + admin.apiToken)
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
    });

    it('returns a 404 if no user with the given id exists', function (done) {
      factory.create('User', {isAdmin: true}, function (err, user) {
        request.delete(url + '/123456789')
               .set('Authorization', 'Bearer ' + user.apiToken)
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
               .set('Authorization', 'Bearer ' + user.apiToken)
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

    describe('when the admin wants to delete itself', function () {
      it('returns a 403 forbidden', function (done) {
        factory.create('User', {isAdmin: true}, function (err, user) {
          request.delete(url + '/' + user.id)
                 .set('Authorization', 'Bearer ' + user.apiToken)
                 .end(function (err, res) {
                   expect(err).to.exist;

                   expect(res.statusCode).to.eql(errors.forbidden.code);
                   expect(res.body).to.eql(errors.forbidden.data);

                   done();
                 });
        });
      });
    });

    it('delete user template and job', function (done) {
      factory.create('User', {isAdmin: true}, function (err, admin) {
        factory.create('User', function (err, user) {
          factory.create('Template', {userId: user.id}, function (err, templ) {
            factory.create('Job', {templateId: templ.id}, function (err, job) {
              request.delete(url + '/' + user.id)
                     .set('Authorization', 'Bearer ' + admin.apiToken)
                     .end(function (err, res) {
                       expect(res.statusCode).to.eql(200);

                       User.findById(user.id).then(function (u) {
                         expect(u).to.not.exist;
                         return Template.findById(templ.id);
                       }).then(function (t) {
                         expect(t).to.not.exist;
                         return Job.findById(job.id);
                       }).then(function (j) {
                         expect(j).to.not.exist;
                         done();
                       }).catch(done);
                     });
            });
          });
        });
      });
    });
  });
});
