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
var all = gendokHttp.middleware.all;
var error = gendokHttp.middleware.error;
var errors = gendokHttp.api.errors;
var helper = require('../../helper');
var request = require('superagent');
var expect = require('chai').expect;

describe('gendok.http.middleware.error', function () {
  var url = helper.getUrl('');
  var server = helper.runHttpServer(this, [all]);

  it('is a function', function (done) {
    expect(error).to.be.a('function');
    done();
  });

  it('generates useful error data for invalid JSON', function (done) {
    var invalidJson = '{"abc": 2,}';

    request.post(url)
           .send(invalidJson)
           .set('Content-Type', 'application/json')
           .end(function (err, res) {
             console.log(err);
             console.log(res);
             expect(err).to.exist;
             expect(res.statusCode).to.eql(400);
             epxect(res.body).to.eql(errors.jsonSyntaxError.data);
             done();
           });
  });
});
