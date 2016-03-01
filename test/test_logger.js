/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var winston = require('winston'),
    util    = require('util'),
    path    = require('path'),
    expect  = require('chai').expect,
    logger  = require('..').logger,
    env     = require('..').env,
    h       = require('./helper');

describe('gendok.logger', function () {
  it('is an object', function () {
    expect(logger).to.be.an('object');
  });

  afterEach(function () {
    logger.instance = null;
  });

  describe('log()', function () {
    it('creates a logger if necessary', function () {
      logger._logger = null;

      expect(logger.get()).to.not.exist;
      logger.log('blub');
      expect(logger.get()).to.exist;
    });
  });

  describe('info(), warn(), error(), debug()', function () {
    it('each calls log() on the actual logger', function () {
      var count  = 0,
          args   = ['%s', 'hello world'],
          levels = ['info', 'warn', 'error', 'debug'];

      logger._logger = {
        create: function () { return {}; },
        log:    function (level, a) {
          expect(levels).to.include(level);
          expect(a).to.include(args);
          count++;
        }
      };

      levels.forEach(function (l) { logger[l](l, args); });
      expect(count).to.eql(4);
    });
  });

  describe('create()', function () {
    describe('without a config', function () {
      it('returns a configured winston.Logger instance', function () {
        var l = logger.create();
        expect(Object.keys(l.transports).length).to.be.above(0);
      });
    });

    describe('with config', function () {
      it('passes it directly to the winston.Logger constructor', function () {
        var trans    = new winston.transports.Console({label: 'gugus'}),
            config   = {transports: [trans]},
            created  = logger.create(config),
            expected = new winston.Logger(config);

        expect(created.transports).to.eql(expected.transports);
      });
    });
  });

  describe('configure()', function () {
    it('configures the default instance', function () {
      var label  = 'blabla',
          transp = new winston.transports.Console({label: label}),
          config = {transports: [transp]};

      // Nasty!
      logger._logger = null;
      expect(logger.get()).to.not.exist;
      logger.configure();
      expect(logger.get()).to.exist;
    });
  });

  describe('in production / development environments', function () {
    it('has a file transport logging to `cwd`/$GENDOK_ENV.log', function () {
      var envs = ['development', 'production'];

      envs.forEach(function (e) {
        h.withGendokEnv(e, function () {
          var file = util.format('%s/%s.log', process.cwd(), env.get()),
              t    = logger.create().transports.file;

          expect(path.join(t.dirname, t.filename)).to.eql(file);
        });
      });
    });
  });

  describe('in test environment', function () {
    it('has the console transport disabled', function () {
      h.withGendokEnv('test', function () {
        var trans = Object.keys(logger.create().transports);
        expect(trans).to.not.include('console');
      });
    });
  });
});
