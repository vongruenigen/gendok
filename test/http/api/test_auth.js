
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
var config = gendok.config;
var util = gendok.util;
var auth = gendok.http.api.auth;
var all = gendok.http.middleware.all;
var errors = gendok.http.api.errors;
var db = require('../../..').data.db;
var expect = require('chai').expect;
var helper = require('../../helper');
var request = require('superagent');
var jwt = require('jsonwebtoken');
var simple = require('simple-mock');

describe('gendok.http.api.auth', function () {
  var factory = helper.loadFactories(this);
  var server = helper.runHttpServer(this, [all, auth]);
  var signInUrl = helper.getUrl('/api/auth/signin');
  var signOutUrl = helper.getUrl('/api/auth/signout');
  var User = null;

  beforeEach(function () {
    User = db.getModel('User');
  });

  it('is a function', function () {
    expect(auth).to.be.a('function');
  });

  describe('POST /api/auth/signin', function () {
    describe('when valid username and password are given', function () {
      describe('when no confirmationToken is set on the user', function () {
        it('returns a 200 and a valid JWT', function (done) {
          factory.create('User', function (err, user) {
            expect(err).to.not.exist;

            request.post(signInUrl)
                   .send({username: user.email, password: user.password})
                   .end(function (err, res) {
                     expect(err).to.not.exist;
                     expect(res.body.token).to.exist;

                     var token = res.body.token;
                     var secret = config.get('jwt_secret');

                     user.reload().then(function (u) {
                       expect(u.apiToken).to.eql(res.body.token);
                       expect(u.email).to.eql(res.body.email);
                       expect(util.verifyJwt(u.apiToken)).to.be.true;
                       done();
                     });
                   });
          });
        });
      });

      describe('when an already valid JWT is set on the user', function () {
        it('returns the existing JWT', function (done) {
          factory.create('User', function (err, user) {
            expect(err).to.not.exist;

            var fakeToken = 'my-fake-jwt-token';
            simple.mock(util, 'verifyJwt').returnWith(true);

            user.update({apiToken: fakeToken}).then(function () {
              request.post(signInUrl)
                     .send({username: user.email, password: user.password})
                     .end(function (err, res) {
                       expect(err).to.not.exist;
                       console.log(res.body);
                       expect(res.body.token).to.exist;
                       expect(res.body.token).to.eql(fakeToken);
                       done();
                     });
            });
          });
        });
      });

      describe('when a confirmationToken is set on the user', function () {
        it('returns 403', function (done) {
          factory.create('User', function (err, user) {
            expect(err).to.not.exist;

            user.update({confirmationToken: 'abc'}).then(function () {
              request.post(signInUrl)
                     .send({username: user.email, password: user.password})
                     .end(function (err, res) {
                       expect(err).to.exist;
                       expect(res.statusCode).to.eql(errors.forbidden.code);
                       expect(res.body).to.eql(errors.forbidden.data);
                       done();
                     });
            });
          });
        });
      });
    });

    describe('when an invalid username or password is given', function () {
      it('returns a 401 and no JWT', function (done) {
        factory.create('User', function (err, user) {
          expect(err).to.not.exist;

          request.post(signInUrl)
                 .send({username: user.email, password: 'akldjfalsdkfj'})
                 .end(function (err, res) {
                   expect(err).to.exist;
                   expect(res.body.token).to.not.exist;

                   user.reload().then(function (u) {
                     expect(u.token).to.be.empty;
                     done();
                   });
                 });
        });
      });
    });
  });

  describe('POST /api/auth/signout', function () {
    describe('when the user has logged in before', function () {
      it('removes the users api token', function (done) {
        factory.create('User', function (err, user) {
          expect(err).to.not.exist;

          request.post(signInUrl)
                 .send({username: user.email, password: user.password})
                 .end(function (err, res) {
                   expect(err).to.not.exist;

                   user.reload().then(function (user) {
                     request.post(signOutUrl)
                            .set('Authorization', 'Bearer ' + user.apiToken)
                            .end(function (err, res) {
                              expect(err).to.not.exist;
                              expect(res.statusCode).to.eql(200);

                              user.reload().then(function (u) {
                                expect(u.apiToken).to.be.empty;
                                done();
                              });
                            });
                   });
                 });
        });
      });
    });

    describe('when the user has not logged in before', function () {
      it('returns a 400', function (done) {
        factory.create('User', function (err, user) {
          expect(err).to.not.exist;

          request.post(signOutUrl)
                  .set('Authorization', 'Bearer abc123')
                  .end(function (err, res) {
                    expect(err).to.exist;
                    expect(res.statusCode).to.eql(errors.badRequest.code);
                    expect(res.body).to.eql(errors.badRequest.data);
                    done();
                  });
        });
      });
    });
  });
});
