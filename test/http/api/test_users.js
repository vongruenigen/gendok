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
      factory.create('User', function (err, creator) {
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
      factory.create('User', function (err, creator) {
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
      factory.create('User', function (err, creator) {
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
  });

  describe('GET /api/users/:id', function () {
    it('the specified user as a JSON object', function (done) {
      factory.create('User', function (err, creator) {
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
