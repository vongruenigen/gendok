/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

var gendok = require('../../..');
var basicMiddleware = gendok.http.middleware.basic;
var authMiddleware = gendok.http.middleware.authorization;
var statusApi = gendok.http.api.status;
var errors = gendok.http.api.errors;
var request = require('superagent');
var helper = require('../../helper');
var expect = require('chai').expect;
var format = require('util').format;

'use strict';

describe('gendok.http.api.status', function () {
  it('is a function', function () {
    expect(statusApi).to.be.a('function');
  });

  var factory = helper.loadFactories(this);
  var middleware = [basicMiddleware, authMiddleware, statusApi];
  var server = helper.runHttpServer(this, middleware);
  var config = server.getConfig();
  var url = format('%s:%d/api/status',
                   config.get('http_host'), config.get('http_port'));

  describe('GET /api/status/', function () {
    describe('with an invalid token', function () {
      it('returns a 401 http status code', function (done) {
        factory.create('User', function (err, user) {
          request.get(url)
                 .set('Authorization', 'Token blub')
                 .end(function (err, res) {
                   expect(err).to.exist;
                   expect(res.statusCode).to.eql(401);
                   done();
                 });
        });
      });

      it('returns an unauthorized error', function (done) {
        request.get(url)
               .set('Authorization', 'Token blub')
               .end(function (err, res) {
                 expect(err).to.exist;
                 expect(res.statusCode).to.eql(errors.unauthorized.code);
                 expect(res.body).to.eql(errors.unauthorized.data);
                 done();
               });
      });
    });

    describe('with a valid token', function () {
      it('returns a 200 http status code', function (done) {
        factory.create('User', function (err, user) {
          console.log(user.apiToken);
          request.get(url)
                 .set('Authorization', 'Token ' + user.apiToken)
                 .end(function (err, res) {
                   expect(err).to.not.exist;
                   expect(res.statusCode).to.eql(200);
                   done()
                 });
        });
      });
    });
  });
});
