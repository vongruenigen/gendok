/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var Config = require('..').config,
    env    = require('..').env,
    h      = require('./helper'),
    simple = require('simple-mock'),
    expect = require('chai').expect;

describe('gendok.config', function () {
    var exampleCfg = {
      development: {username: 'blub', abc: 'gugus'},
      test:        {username: 'blub', abc: 'gugus'},
      production:  {username: 'blub', abc: 'gugus'}
    };

    it('is a function', function () {
        expect(Config).to.be.a('function');

        var cfg = new Config();
        expect(cfg).to.be.an('object');
    });

    describe('constructor()', function () {
      it('sanitizes the options', function () {
        var config    = new Config(exampleCfg),
            sanitized = Config.sanitizeOptions(exampleCfg.test);

        expect(config.toObject()).to.eql(sanitized);
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

    describe('toObject()', function () {
      it('returns the config as an object', function () {
        var config    = new Config(exampleCfg),
            sanitized = Config.sanitizeOptions(exampleCfg.test);

        expect(config.toObject()).to.eql(sanitized);
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
            var availableOpts = Config.getAvailableOptions(),
                keys          = ['xyz', 'abc'],
                options       = {};

            availableOpts.concat(keys).forEach(function (value) {
                options[value] = 'abc';
            });

            var sanitizedOptions = Config.sanitizeOptions(options);

            expect(sanitizedOptions).to.be.an('object');
            expect(sanitizedOptions).not.to.include.keys(keys);
            expect(sanitizedOptions).to.include.keys(availableOpts);
        });
    });
});
