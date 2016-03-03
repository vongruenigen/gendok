/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var HttpServer = require('../../').http.server,
    Config     = require('../../').config,
    expect     = require('chai').expect;

describe('gendok.http.Server', function () {
  it('is a constructor', function () {
    expect(HttpServer).to.be.a('function');
  });

  var defaultConfig = Config.getDefault(),
      httpServer    = null;

  afterEach(function (done) {
    if (httpServer && httpServer.isRunning()) {
      httpServer.stop(done);
    } else { done(); }

    httpServer = null;
  });

  describe('constructor', function () {
    it('creates an express app', function () {
      httpServer = new HttpServer(defaultConfig);
      expect(httpServer.getApp()).to.exist;
    });
  });

  describe('getConfig()', function () {
    it('returns the associated Config object', function () {
      httpServer = new HttpServer(defaultConfig);
      expect(httpServer.getConfig()).to.eql(defaultConfig);
    });
  });

  describe('start()', function () {
    beforeEach(function (done) {
      httpServer = new HttpServer(defaultConfig);
      httpServer.start(done);
    });

    it('can be called several times', function (done) {
      expect(httpServer.isRunning()).to.eql(true);
      httpServer.start(done);
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
      httpServer = new HttpServer(defaultConfig);

      httpServer.start(function (err) {
        expect(err).to.not.exist;
        expect(httpServer.isRunning()).to.be.true;
        done();
      });
    });
  });

  describe('getApp()', function () {
    it('returns the express app', function () {
      httpServer = new HttpServer(defaultConfig);

      expect(httpServer.getApp()).to.exist;
      expect(httpServer.getApp().engine).to.exist;
    });
  });

  describe('registerModule()', function () {
    it('calls the module with the app as the argument', function (done) {
      httpServer = new HttpServer(defaultConfig);

      var myModule = function (app) {
        expect(app).to.eql(httpServer.getApp());
        done();
      };

      httpServer.registerModule(myModule);
    });

    it('throws an error if the module is not a function', function () {
      var httpServer = new HttpServer(defaultConfig),
          moduleFn   = 'blub';

      expect(function () { httpServer.registerModule(moduleFn); }).to.throw(Error);
    });
  });
});
