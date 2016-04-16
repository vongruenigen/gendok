/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var Browser = require('zombie');
var expect = require('chai').expect;
var config = require('../../..').config;
var http = require('../../../').http;
var helper = require('../../helper');
var HttpServer = http.server;
var web = http.web;

describe('gendok.http.web.home', function () {
  it('is a function', function () {
    expect(web.home).to.be.a('function');
  });

  var factory = helper.loadFactories(this);
  var browser = new Browser();
  var modules = [http.middleware.basic, web.home];

  // Register http server hooks
  helper.runHttpServer(this, modules);
  Browser.localhost(config.get('http_host'), config.get('http_port'));

  describe('/', function () {
    beforeEach(function (done) {
      browser.visit('/', done);
    });

    it('contains the text "gendok"', function (done) {
      browser.assert.success();
      browser.assert.text('h1.title', 'gendok');
    });
  });
});
