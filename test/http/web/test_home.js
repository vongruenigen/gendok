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
var HttpServer = http.server;
var web = http.web;

describe('gendok.http.web.home', function () {
  it('is a function', function () {
    expect(web.home).to.be.a('function');
  });

  before(function (done) {
    server = new HttpServer(config);
    server.registerModules(modules);
    server.start(function (err) {
      expect(server.isRunning()).to.eql(true);
      done(err);
    });
  });

  after(function (done) {
    server.stop(done);
    server = null;
  });

  var server = null;
  var browser = new Browser();
  var config = Config.getDefault();
  var modules = [http.middleware.basic, web.home];
  Browser.localhost(config.get('http_host'), config.get('http_port'));

  describe('#index', function () {
    it('containts the text "Welcome to gendok"', function (done) {
      browser.visit('/', function(err) {
        expect(err).to.not.exist;
        browser.assert.success();
        browser.assert.text('h1', 'Welcome to gendok');
        done();
      });
    });
  });
});
