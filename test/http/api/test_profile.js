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
               .set('Authorization', 'Token ' + user.apiToken)
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
      factory.create('User', function (err, user) {
        var attrs = {name: ''};

        request.put(url)
               .send(attrs)
               .set('Content-Type', 'application/json')
               .set('Authorization', 'Token ' + user.apiToken)
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
});
