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
var all = gendok.http.middleware.all;
var status = gendok.http.api.status;
var errors = gendok.http.api.errors;
var request = require('superagent');
var helper = require('../../helper');
var expect = require('chai').expect;

describe('gendok.http.api.status', function () {
  it('is a function', function () {
    expect(status).to.be.a('function');
  });

  var factory = helper.loadFactories(this);
  var server = helper.runHttpServer(this, [all, status]);
  var url = helper.getUrl('/api/status');

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
          request.get(url)
                 .set('Authorization', 'Token ' + user.apiToken)
                 .end(function (err, res) {
                   expect(err).to.not.exist;
                   expect(res.statusCode).to.eql(200);
                   done();
                 });
        });
      });
    });

    describe('without a Authorization header', function () {
      it('returns an unauthorized error', function (done) {
        request.get(url).end(function (err, res) {
          expect(err).to.exist;
          expect(res.statusCode).to.eql(errors.unauthorized.code);
          expect(res.body).to.eql(errors.unauthorized.data);
          done();
        });
      });
    });
  });
});
