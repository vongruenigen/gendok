/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var Config = require('..').config;
var env = require('..').env;
var h = require('./helper');
var simple = require('simple-mock');
var expect = require('chai').expect;

describe('gendok.config', function () {
  var exampleCfg = {
    development: {username: 'blub1', abc: 'gugus1'},
    test:        {username: 'blub2', abc: 'gugus2'},
    production:  {username: 'blub3', abc: 'gugus3'}
  };

  it('is a function', function () {
    expect(Config).to.be.a('function');

    var cfg = new Config();
    expect(cfg).to.be.an('object');
  });

  describe('get()', function () {
    it('returns the value associated with the given key', function () {
      var config = new Config(exampleCfg);
      expect(config.get('username')).to.eql(exampleCfg.test.username);
    });
  });

  describe('get()', function () {
    it('set the associated value for the given key', function () {
      var config = new Config(exampleCfg);
      var name = exampleCfg.test.username + 'gaga';

      config.set('username', name);
      expect(config.get('username')).to.eql(name);
    });
  });

  describe('constructor()', function () {
    it('sanitizes the options', function () {
      var config = new Config(exampleCfg);
      var sanitized = Config.sanitizeOptions(exampleCfg.test);

      expect(config.toObject()).to.include(sanitized);
    });

    it('merges the default config', function () {
      var options = {http_port: '1234', http_host: 'abc.com'};
      var config  = new Config(options);
      var defaultConfig = Config.getDefault();

      Object.keys(defaultConfig).forEach(function (k) {
        if (options[k]) {
          expect(config.get(k)).to.eql(options[k]);
        } else {
          expect(config.get(k)).to.eql(defaultConfig.get(k));
        }
      });
    });

    describe('when an environment section exists', function () {
      it('loads the section matching the environment', function () {
        var obj = {
          development: {username: '1'},
          test:        {username: '2'},
          production:  {username: '3'}
        };

        env.getValidEnvs().forEach(function (e) {
          h.withGendokEnv(e, function () {
            var config = new Config(obj);
            expect(config.get('username')).to.eql(obj[e].username);
          });
        });
      });
    });
  });

  describe('getDefault()', function () {
    it('returns config/default.json as a Config object', function () {
      var configObj = require('../config/default.json');
      var defaultConfig = Config.getDefault();

      Object.keys(configObj).forEach(function (k) {
        expect(defaultConfig.get(k)).to.eql(configObj[k]);
      });
    });
  });

  describe('toObject()', function () {
    it('returns the config as an object', function () {
      var config = new Config(exampleCfg);
      var configObj = config.toObject();

      Object.keys(configObj).forEach(function (k) {
        expect(configObj[k]).to.eql(config.get(k));
      });
    });
  });

  describe('getAvailableOptions()', function () {
    it('returns an array of strings', function () {
      var availableOpts = Config.getAvailableOptions();

      expect(availableOpts).to.be.an('array');
      expect(availableOpts.length).to.be.above(0);

      availableOpts.forEach(function (value) {
        expect(value).to.be.a('string');
      });
    });
  });

  describe('sanitizeOptions()', function () {
    it('removes all unavailable options from the object', function () {
      var availableOpts = Config.getAvailableOptions();
      var keys = ['xyz', 'abc'];
      var options = {};
      var sanitizedOptions;

      availableOpts.concat(keys).forEach(function (value) {
        options[value] = 'abc';
      });

      sanitizedOptions = Config.sanitizeOptions(options);

      expect(sanitizedOptions).to.be.an('object');
      expect(sanitizedOptions).not.to.include.keys(keys);
      expect(sanitizedOptions).to.include.keys(availableOpts);
    });
  });
});
