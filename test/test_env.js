/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var env    = require('..').env,
    h      = require('./helper'),
    expect = require('chai').expect;

describe('gendok.env', function () {
  it('is an object', function () {
    expect(env).to.be.a('object');
  });

  var randEnv = h.shuffle(env.getValidEnvs())[0];

  describe('get()', function () {
    it('returns the current environment', function () {
      h.withGendokEnv(randEnv, function () {
        expect(env.get()).to.eql(randEnv);
      });
    });

    it('defaults to "development" if missing or invalid', function () {
      var expects = {
        '': 'development',
        'testing': 'development',
        'prod':    'development'
      };

      Object.keys(expects).forEach(function (key) {
        h.withGendokEnv(key, function () {
          expect(env.get()).to.eql(expects[key]);
        });
      });
    });
  });

  describe('set()', function () {
    it('sets the running environment', function () {
      var validEnv = env.getValidEnvs()[0];

      env.set(validEnv);
      expect(process.env.GENDOK_ENV).to.eql(validEnv);
    });

    describe('when an invalid running environment is used', function () {
      it('throws an error', function () {
        expect(function () { env.set('gugus'); }).to.throw(Error);
      });
    });
  });

  describe('is()', function () {
    it('checks if the return value of get() equals the param', function () {
      h.withGendokEnv(randEnv, function () {
        expect(env.is(randEnv)).to.eql(true);
      });

      h.withGendokEnv('test', function () {
        expect(env.is('development')).to.eql(false);
      });

      expect(function () { env.is(null); }).to.not.throw(Error);
    });
  });
});
