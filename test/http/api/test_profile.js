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
var profile = gendokHttp.api.profile;
var all = gendokHttp.middleware.all;
var errors = gendokHttp.api.errors;
var db = require('../../..').data.db;
var util = require('../../..').util;
var expect = require('chai').expect;
var helper = require('../../helper');
var request = require('superagent');
var simple = require('simple-mock');
var format = require('util').format;

describe('gendok.http.api.profile', function () {
  var factory = helper.loadFactories(this);
  var queue = helper.createQueue(this);
  var server = helper.runHttpServer(this, [all, profile]);
  var url = helper.getUrl('/api/profile/');

  var User;

  beforeEach(function () {
    User = db.getModel('User');
  });

  it('is a function', function () {
    expect(profile).to.be.a('function');
  });

  describe('GET /api/profile/', function () {
    it('the profile (user) as a JSON object', function (done) {
      factory.create('User', function (err, user) {
        request.get(url)
               .set('Authorization', 'Bearer ' + user.apiToken)
               .end(function (err, res) {
                 expect(err).to.not.exist;
                 expect(res.statusCode).to.eql(200);
                 expect(res.body).to.deep.equal(user.toPublicObject());
                 done();
               });
      });
    });

    it('returns an unauthorized error without a valid api-token', function (done) {
      request.get(url)
             .set('Authorization', 'Token blubiblub')
             .end(function (err, res) {
               expect(err).to.exist;
               expect(res.statusCode).to.eql(errors.unauthorized.code);
               expect(res.body).to.eql(errors.unauthorized.data);
               done();
             });
    });
  });

  describe('PUT /api/profile/', function () {
    it('update a profile (user) in the database', function (done) {
      factory.create('User', function (err, user) {
        var attrs = {name: 'gendok'};

        request.put(url)
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
      factory.create('User', function (err, user) {
        var attrs = {name: ''};

        request.put(url)
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

    it('updates the password in the database', function (done) {
      factory.create('User', function (err, user) {
        var attrs = {
          password: 'abc123456',
          passwordConfirmation: 'abc123456'
        };

        request.put(url)
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
      factory.create('User', function (err, user) {
        var attrs = {
          password: 'abc123456',
          passwordConfirmation: 'abc123457'
        };

        request.put(url)
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

    it('returns an unauthorized error without a valid api-token', function (done) {
      factory.create('User', function (err, user) {
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

  describe('GET /api/profile/confirm', function () {
    var url = helper.getUrl('/api/profile/confirm');

    describe('when no confirmationToken is given', function () {
      it('returns a bad request error', function (done) {
        request.get(url).end(function (err, res) {
          expect(err).to.exist;
          expect(res.statusCode).to.eql(errors.badRequest.code);
          expect(res.body).to.eql(errors.badRequest.data);
          done();
        });
      });
    });

    describe('when a valid confirmationToken is given', function () {
      it('returns a valid JWT and confirms the user', function (done) {
        var token = util.randomToken(32);

        factory.create('User', function (err, u) {
          u.update({confirmationToken: token}).then(function (u) {
            request.get(url + '?token=' + token)
                   .end(function (err, res) {
                      expect(err).to.not.exist;
                      expect(res.statusCode).to.eql(200);
                      expect(res.body.token).to.exist;
                      expect(res.body.email).to.eql(u.email);

                      u.reload().then(function (u1) {
                        expect(u.apiToken).to.eql(res.body.token);
                        expect(u.isConfirmed()).to.be.true;
                        done();
                      });
                    });
          });
        });
      });
    });

    describe('when an invalid confirmationToken is given', function () {
      it('returns a bad request error', function (done) {
        request.get(url + '?token=bogus')
               .end(function (err, res) {
                 expect(err).to.exist;
                 expect(res.statusCode).to.eql(errors.badRequest.code);
                 expect(res.body).to.eql(errors.badRequest.data);
                 done();
               });
      });
    });
  });

  describe('POST /api/profile/signup', function () {
    var url = helper.getUrl('/api/profile/signup');

    describe('when invalid values are posted', function () {
      it('returns the validation errors', function (done) {
        var values = {
          name: 'John The Error Doe',
          email: 'my-invalid-email',
          password: 'blub1234577',
          passwordConfirmation: 'blub12345678892'
        };

        factory.build('User', values, function (err, u) {
          request.post(url)
                 .send(JSON.stringify(values))
                 .set('Content-Type', 'application/json')
                 .end(function (err, res) {
                   expect(err).to.exist;
                   expect(res.statusCode).to.eql(errors.validation.code);

                   User.create(u.toJSON()).catch(function (err) {
                     var expectedError = errors.validation.data(err);
                     expect(res.body).to.eql(expectedError);
                     done();
                   });
                 });
        });
      });
    });

    describe('when valid values are posted', function () {
      it('creates a new user', function (done) {
        factory.build('User', function (err, u) {
          expect(err).to.not.exist;

          var values = {
            email: u.email,
            name: u.name,
            password: 'abc1234567',
            passwordConfirmation: 'abc1234567'
          };

          request.post(url)
                 .send(JSON.stringify(values))
                 .set('Content-Type', 'application/json')
                 .end(function (err, res) {
                   expect(err).to.not.exist;
                   expect(res.statusCode).to.eql(201);
                   expect(res.body.name).to.eql(values.name);
                   expect(res.body.email).to.eql(values.email);

                   User.findOne({
                     where: {email: res.body.email}
                   }).then(function (u) {
                     expect(u).to.exist;
                     done();
                   });
                 });
        });
      });
    });
  });

  describe('POST /api/profile/reset-password?email=...', function () {
    var url = helper.getUrl('/api/profile/reset-password');

    describe('when an existing email is given', function () {
      it('sets the resetPasswordToken and sends an email', function (done) {
        factory.create('User', function (err, u) {
          expect(err).to.not.exist;

          var jobsCountBefore = queue.testMode.jobs.length;

          request.post(url + '?email=' + u.email)
                 .end(function (err, res) {
                   expect(err).to.not.exist;
                   expect(res.body.email).to.eql(u.email);

                   var jobsCountAfter = queue.testMode.jobs.length;
                   expect(jobsCountAfter).to.eql(jobsCountBefore + 1);

                   u.reload().then(function (u) {
                     expect(u.resetPasswordToken).to.exist;
                     done();
                   });
                 });
        });
      });
    });

    describe('when an inexistent username is given', function () {
      it('returns 200 but sends no email', function (done) {
        var jobsCountBefore = queue.testMode.jobs.length;
        var email = 'abc12345@gendok.ch';

        request.post(url + '?email=' + email)
               .end(function (err, res) {
                 expect(err).to.not.exist;
                 expect(res.body.email).to.eql(email);

                 var jobsCountAfter = queue.testMode.jobs.length;
                 expect(jobsCountAfter).to.eql(jobsCountBefore);
                 done();
               });
      });
    });
  });
});
