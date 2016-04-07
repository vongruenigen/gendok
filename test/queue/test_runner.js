/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var gendok = require('../../');
var config = gendok.config;
var Runner = gendok.queue.runner;
var expect = require('chai').expect;
var simple = require('simple-mock');

describe('gendok.queue.runner', function () {
  it('is a function', function () {
    expect(Runner).to.be.a('function');
  });

  var runner = null;

  beforeEach(function (done) {
    runner = new Runner();
    runner.start(done);
  });

  afterEach(function (done) {
    runner.stop(done);
    runner = null;
  });

  describe('start()', function () {
    it('can be called several times', function (done) {
      expect(runner.isRunning()).to.eql(true);
      runner.start(done);
    });

    it('throws an error if the callback is missing', function () {
      expect(function () { runner.start(null); }).to.throw(Error);
    });
  });

  describe('stop()', function () {
    it('invokes the callback immediately if the queue is not running', function (done) {
      (new Runner()).stop(done);
    });
  });

  describe('isRunning()', function () {
    it('returns false if the server has not been started', function () {
      expect((new Runner()).isRunning()).to.eql(false);
    });

    it('returns true after the queue has been started', function (done) {
      var r = new Runner();

      r.start(function (err) {
        expect(err).to.not.exist;
        expect(runner.isRunning()).to.be.true;
        done();
      });
    });
  });

  describe('getApp()', function () {
    it('returns the kue queue', function () {
      expect(runner.getQueue()).to.exist;
    });
  });

  describe('registerWorker()', function () {
    it('registers the worker on the queue', function () {
      var queue = runner.getQueue();
      var key = 'blub';
      var workerFn = function () {};

      simple.mock(queue, 'process').callOriginal();
      runner.registerWorker(key, workerFn);

      expect(queue.process.callCount).to.eql(1);
      expect(queue.process.lastCall.args[0]).to.eql(key);
      expect(queue.process.lastCall.args[1]).to.eql(workerFn);
    });

    it('throws an error if the worker is not a function', function () {
      var r = new Runner();
      var workerFn = 'blub';

      expect(function () {
        r.registerWorker('blub', workerFn);
      }).to.throw(Error);
    });

    it('throws an error if key is empty or missing', function () {
      var r = new Runner();

      expect(function () {
        r.registerWorker('', function () {});
      }).to.throw(Error);
    });
  });

  describe('registerWorkers()', function () {
    it('registers all workers of the object on the queue', function () {
      var queue = runner.getQueue();
      var workerFn = function () {};

      var workers = {
        blub1: workerFn,
        blub2: workerFn,
        blub3: workerFn
      };

      simple.mock(queue, 'process').callOriginal();
      runner.registerWorkers(workers);

      var keys = Object.keys(workers);
      var count = 0;

      expect(queue.process.callCount).to.eql(keys.length);

      Object.keys(workers).forEach(function (k) {
        var currentCall = queue.process.calls[count];

        expect(currentCall.args[0]).to.eql(k);
        expect(currentCall.args[1]).to.eql(workers[k]);
        count++;
      });
    });

    it('throws if the workers param is null or undefined', function () {
      expect(function () { runner.registerWorkers(); }).to.throw(Error);
    });
  });
});
