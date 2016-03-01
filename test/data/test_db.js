/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var db     = require('../..').data.db,
    model  = require('../..').data.model,
    Config = require('../..').config,
    expect = require('chai').expect;

describe('gendok.data.db', function () {
  var config = new Config({
    database: 'gendok_test',
    username: 'gendok_test',
    password: 'gendok_test',
    storage:  ':memory:',
    dialect:  'sqlite'
  });

  it('is an object', function () {
    expect(db).to.be.an('object');
  });

  before(function () {
    // Ensure there's no open database connection left
    db.disconnect();
  });

  describe('connect()', function () {
    it('creates a new connection', function () {
      var conn = db.connect(config);

      expect(conn).to.exist;
      expect(db.isConnected()).to.be.true;
    });

    it('ignores further calls after a connection has been established', function () {
      var conn = db.connect(config), conn2 = db.connect(config);
      expect(conn2 === conn).to.be.true;
    });

    it('throws an error if the config param is missing', function () {
      expect(function () { db.connect(null); }).to.throw(Error);
    });

    it('loads all models', function () {
      var conn = db.connect(config);

      expect(conn.models).to.be.an('object');

      for (var k in model) {
        if (model.hasOwnProperty(k)) {
          expect(conn.models[k]).to.exist;
        }
      }
    });
  });

  describe('disconnect()', function () {
    it('disconnects from the database', function () {
      db.connect(config);
      db.disconnect();

      expect(db.getConnection()).to.not.exist;
    });
  });

  describe('getConnection()', function () {
    it('returns the established connection', function () {
      var conn = db.connect(config);
      expect(conn).to.eql(db.getConnection());
    });
  });
});
