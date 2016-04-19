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
var partials = gendokHttp.web.partials;
var all = gendokHttp.middleware.all;
var expect = require('chai').expect;
var helper = require('../../helper');
var request = require('superagent');

describe('gendok.http.web.partials', function () {
  it('is a function', function () {
    expect(partials).to.be.a('function');
  });

  var server = helper.runHttpServer(this, [partials, all]);
  var url = helper.getUrl('/partials');

  describe('GET /partials/:name', function () {
    it('returns the rendered templates as html', function (done) {
      request.get(url + '/error')
             .end(function (err, res) {
               expect(err).to.not.exist;
               expect(res.get('Content-Type')).to.include('text/html');
               expect(res.get('Content-Length')).to.be.above(0);
               done();
             });
    });

    it('returns a 404 for a non existing template', function (done) {
      request.get(url + '/blub')
             .end(function (err, res) {
               expect(err).to.exist;
               expect(res.statusCode).to.eql(404);
               done();
             });
    });
  });
});
