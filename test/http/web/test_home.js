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
var Config = require('../../..').config;
var http = require('../../../').http;
var helper = require('../../helper');
var HttpServer = http.server;
var web = http.web;

describe('gendok.http.web.home', function () {
  it('is a function', function () {
    expect(web.home).to.be.a('function');
  });

  var browser = new Browser();
  var modules = [http.middleware.basic, web.home];
  var config = Config.getDefault();

  // Register http server hooks
  helper.runHttpServer(this, modules);
  Browser.localhost(config.get('http_host'), config.get('http_port'));

  describe('#index', function () {
    beforeEach(function (done) {
      browser.visit('/', done);
    });

    it('contains the text "gendok"', function () {
      browser.assert.success();
      browser.assert.text('h1.title', 'gendok');
    });

    it('contains a welcome message from angular', function () {
      browser.assert.success();
      browser.assert.text('.angular-welcome', 'hello world from angular-js!');
    });
  });
});
