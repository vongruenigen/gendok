/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var config = require('..').config;
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

  // We need to reset the config after this tests otherwise our other tests
  // will fail because of invalid db credentials etc.
  var configBefore = config.toObject();

  after(function () {
    config.load(configBefore);
  });

  it('is an object', function () {
    expect(config).to.be.a('object');
  });

  describe('load()', function () {
    it('stores the given config as a string in GENDOK_$ENV_CONFIG', function () {

    });

    it('sanitizes the options', function () {
      config.load(exampleCfg);
      var sanitized = config.sanitizeOptions(exampleCfg.test);
      expect(config.toObject()).to.include(sanitized);
    });

    it('merges the default config', function () {
      var options = {http_port: '1234', http_host: 'abc.com'};
      config.load(options);

      var defaultConfig = config.getDefault();

      Object.keys(defaultConfig).forEach(function (k) {
        if (options[k]) {
          expect(config.get(k)).to.eql(options[k]);
        } else {
          expect(config.get(k)).to.eql(defaultConfig[k]);
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
            config.load(obj);
            expect(config.get('username')).to.eql(obj[e].username);
          });
        });
      });
    });
  });

  describe('envKey()', function () {
    it('returns the current env key', function () {
      env.getValidEnvs().forEach(function (e) {
        h.withGendokEnv(e, function () {
          var expectedKey = 'GENDOK_' + env.get().toUpperCase() + '_CONFIG';
          expect(config.envKey()).to.eql(expectedKey);
        });
      });
    });
  });

  describe('get()', function () {
    it('returns the value associated with the given key', function () {
      config.load(exampleCfg);
      expect(config.get('username')).to.eql(exampleCfg.test.username);
    });
  });

  describe('set()', function () {
    it('set the associated value for the given key', function () {
      var name = exampleCfg.test.username + 'gaga';

      config.load(exampleCfg);
      config.set('username', name);

      expect(config.get('username')).to.eql(name);
    });
  });

  describe('getDefault()', function () {
    it('returns config/default.json as a Config object', function () {
      var configObj = require('../config/default.json')[env.get()];
      var defaultConfig = config.getDefault();

      Object.keys(configObj).forEach(function (k) {
        expect(defaultConfig[k]).to.eql(configObj[k]);
      });
    });
  });

  describe('toObject()', function () {
    it('returns the config as an object', function () {
      config.load(exampleCfg);
      var configObj = config.toObject();

      Object.keys(configObj).forEach(function (k) {
        expect(configObj[k]).to.eql(config.get(k));
      });
    });
  });

  describe('getAvailableOptions()', function () {
    it('returns an array of strings', function () {
      var availableOpts = config.getAvailableOptions();

      expect(availableOpts).to.be.an('array');
      expect(availableOpts.length).to.be.above(0);

      availableOpts.forEach(function (value) {
        expect(value).to.be.a('string');
      });
    });
  });

  describe('sanitizeOptions()', function () {
    it('removes all unavailable options from the object', function () {
      var availableOpts = config.getAvailableOptions();
      var keys = ['xyz', 'abc'];
      var options = {};
      var sanitizedOptions;

      availableOpts.concat(keys).forEach(function (value) {
        options[value] = 'abc';
      });

      sanitizedOptions = config.sanitizeOptions(options);

      expect(sanitizedOptions).to.be.an('object');
      expect(sanitizedOptions).not.to.include.keys(keys);
      expect(sanitizedOptions).to.include.keys(availableOpts);
    });
  });
});
