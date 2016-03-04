/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var db = require('../..').data.db;
var model  = require('../..').data.model;
var Config = require('../..').config;
var expect = require('chai').expect;

describe('gendok.data.db', function () {
  var config = new Config();

  it('is an object', function () {
    expect(db).to.be.an('object');
  });

  beforeEach(function () {
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
      var conn = db.connect(config);
      var conn2 = db.connect(config);

      expect(conn2 === conn).to.be.true;
    });

    it('throws an error if the config param is missing', function () {
      expect(function () { db.connect(null); }).to.throw(Error);
    });

    it('loads all models', function () {
      var conn = db.connect(config);

      Object.keys(model).forEach(function (k) {
        expect(conn[k]).to.exist;
      });
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
