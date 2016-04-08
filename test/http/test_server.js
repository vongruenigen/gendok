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
var config = require('../../').config;
var expect = require('chai').expect;

describe('gendok.http.Server', function () {
  it('is a constructor', function () {
    expect(HttpServer).to.be.a('function');
  });

  var httpServer = null;

  beforeEach(function (done) {
    httpServer = new HttpServer();
    done();
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

  describe('start()', function () {
    it('can be called several times', function (done) {
      httpServer.start(function (err) {
        expect(err).to.not.exist;

        expect(httpServer.isRunning()).to.eql(true);
        httpServer.start(done);
      });
    });

    it('calls the callback if an error occurs', function (done) {
      httpServer.start(function (err) {
        expect(err).to.not.exist;

        // Just start another server. This will always lead to an error since
        // it uses the same config as the previously started http server.
        var h = new HttpServer();

        h.start(function (err) {
          expect(err).to.exist;
          h.stop(done);
        });
      });
    });

    it('throws an error if the callback is missing', function () {
      expect(function () { httpServer.start(null); }).to.throw(Error);
    });
  });

  describe('stop()', function () {
    it('invokes the callback immediately if the server is not running', function (done) {
      (new HttpServer()).stop(done);
    });
  });

  describe('isRunning()', function () {
    it('returns false if the server has not been started', function () {
      expect((new HttpServer()).isRunning()).to.eql(false);
    });

    it('returns true after the server has been started', function (done) {
      var h = new HttpServer();

      h.start(function (err) {
        expect(err).to.not.exist;
        expect(h.isRunning()).to.be.true;
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
      var h = new HttpServer();

      h.registerModule(function (app, queue) {
        expect(app).to.eql(h.getApp());
        done();
      });
    });

    it('throws an error if the module is not a function', function () {
      var h = new HttpServer();
      var moduleFn = 'blub';

      expect(function () {
        h.registerModule(moduleFn);
      }).to.throw(Error);
    });

    it('throws an error if the server is already running', function (done) {
      httpServer.start(function () {
        expect(function () {
          httpServer.registerModule(function () {});
        }).to.throw(Error);

        done();
      });
    });
  });

  describe('registerModules()', function () {
    it('calls the modules with the app as a parameter', function () {
      var h = new HttpServer();
      var counter = 0;
      var counterFn = function (app) { counter++; };

      h.registerModules([counterFn, counterFn, counterFn]);

      expect(counter).to.eql(3);
    });

    it('throws if the modules param is null or undefined', function () {
      expect(function () {
        var h = new HttpServer();
        h.registerModules();
      }).to.throw(Error);
    });
  });
});
