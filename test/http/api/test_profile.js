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
          expect(err.statusCode).to.not.eql(errors.badRequest.code);
          expect(res.body).to.not.eql(errors.badRequest.data);
          done();
        });
      });
    });

    describe('when a valid confirmationToken is given', function () {
      it('returns a valid JWT and confirms the user', function (done) {
        var token = util.randomToken(32);

        factory.create('User', {confirmationToken: token}, function (err, u) {
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
  });
});
