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
var home = gendokHttp.web.home;
var all = gendokHttp.middleware.all;
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
});
