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
var home = gendok.http.web.home;
var all = gendok.http.middleware.all;
var expect = require('chai').expect;
var helper = require('../../helper');
var request = require('superagent');

describe('gendok.http.web.partials', function () {
  it('is a function', function () {
    expect(home).to.be.a('function');
  });

  helper.runHttpServer(this);
  var url = helper.getUrl('/');

  describe('GET /whatever', function () {
    it('returns the index view as HTML', function (done) {
      request.get(url + '/whatever')
             .end(function (err, res) {
               expect(err).to.not.exist;
               expect(res.get('Content-Type')).to.include('text/html');
               expect(res.get('Content-Length')).to.be.above(0);
               done();
             });
    });
  });

  describe('when ssl is configured', function () {
    it('redirects to the ssl page', function (done) {
      // Set http_ssl_port to null to force the url helper
      // to use http instead of https.
      helper.withConfig({http_ssl_port: null}, function () {
        request.get(helper.getUrl('/'))
               .redirects(0) // disable auto-redirecting
               .end(function (err, res) {
                 expect(err).to.exist;
                 expect(res.statusCode).to.eql(301);
                 expect(res.header.location).to.include('https');
                 done();
               });
      });
    });
  });
});
