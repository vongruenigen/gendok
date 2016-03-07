/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var HttpServer = require('../../').http.server;
var Config = require('../../').config;
var expect = require('chai').expect;

describe('gendok.http.Server', function () {
  it('is a constructor', function () {
    expect(HttpServer).to.be.a('function');
  });

  var defaultConfig = Config.getDefault();
  var defaultPort = parseInt(defaultConfig.get('http_port'));

  var alternativeConfig = Config.getDefault();
  var alternativePort = defaultPort + 1;
  alternativeConfig.set('http_port', alternativePort);

  var httpServer = null;

  beforeEach(function (done) {
    httpServer = new HttpServer(defaultConfig);
    httpServer.start(done);
  });

  afterEach(function (done) {
    httpServer.stop(done);
    httpServer = null;
  });

  describe('constructor', function () {
    it('creates an express app', function () {
      expect(httpServer.getApp()).to.exist;
    });
  });

  describe('getConfig()', function () {
    it('returns the associated Config object', function () {
      expect(httpServer.getConfig()).to.eql(defaultConfig);
    });
  });

  describe('start()', function () {
    it('can be called several times', function (done) {
      expect(httpServer.isRunning()).to.eql(true);
      httpServer.start(done);
    });

    it('calls the callback if an error occurs', function (done) {
      // Just reuse the default config with the same port, this will lead
      // to an error 100% of the time since the desired port is already in use.
      var h = new HttpServer(defaultConfig);

      h.start(function (err) {
        expect(err).to.exist;
        h.stop(done);
      });
    });

    it('throws an error if the callback is missing', function () {
      expect(function () { httpServer.start(null); }).to.throw(Error);
    });
  });

  describe('stop()', function () {
    it('invokes the callback immediately if the server is not running', function (done) {
      (new HttpServer(defaultConfig)).stop(done);
    });
  });

  describe('isRunning()', function () {
    it('returns false if the server has not been started', function () {
      expect((new HttpServer(defaultConfig)).isRunning()).to.eql(false);
    });

    it('returns true after the server has been started', function (done) {
      var h = new HttpServer(alternativeConfig);

      h.start(function (err) {
        expect(err).to.not.exist;
        expect(httpServer.isRunning()).to.be.true;
        h.stop(done);
      });
    });
  });

  describe('getApp()', function () {
    it('returns the express app', function () {
      expect(httpServer.getApp()).to.exist;
      expect(httpServer.getApp().engine).to.exist;
    });
  });

  describe('registerModule()', function () {

    it('calls the module with the app as a parameter', function (done) {
      var h = new HttpServer(alternativeConfig);

      h.registerModule(function (app) {
        expect(app).to.eql(h.getApp());
        done();
      });
    });

    it('throws an error if the module is not a function', function () {
      var h = new HttpServer(alternativeConfig);
      var moduleFn = 'blub';

      expect(function () {
        h.registerModule(moduleFn);
      }).to.throw(Error);
    });

    it('throws an error if the server is already running', function () {
      expect(function () {
        httpServer.registerModule(function () {});
      }).to.throw(Error);
    });
  });

  describe('registerModules()', function () {
    it('calls the modules with the app as a parameter', function () {
      var h = new HttpServer(alternativeConfig);
      var counter = 0;

      h.registerModules([
        function (app) { counter++; },
        function (app) { counter++; },
        function (app) { counter++; },
      ]);

      expect(counter).to.eql(3);
    });
  });
});
