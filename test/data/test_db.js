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
var expect = require('chai').expect;

describe('gendok.data.db', function () {
  it('is an object', function () {
    expect(db).to.be.an('object');
  });

  beforeEach(function () {
    // Ensure there's no open database connection left
    db.disconnect();
  });

  describe('connect()', function () {
    it('creates a new connection', function () {
      var conn = db.connect();

      expect(conn).to.exist;
      expect(db.isConnected()).to.be.true;
    });

    it('ignores further calls after a connection has been established', function () {
      var conn = db.connect();
      var conn2 = db.connect();

      expect(conn2 === conn).to.be.true;
    });

    it('loads all models', function () {
      var conn = db.connect();

      Object.keys(model).forEach(function (k) {
        expect(conn[k]).to.exist;
      });
    });
  });

  describe('disconnect()', function () {
    it('disconnects from the database', function () {
      db.connect();
      db.disconnect();

      expect(db.getConnection()).to.not.exist;
    });
  });

  describe('getConnection()', function () {
    it('returns the established connection', function () {
      var conn = db.connect();
      expect(conn).to.eql(db.getConnection());
    });
  });

  describe('getModel()', function () {
    it('return all models', function () {
      var conn = db.connect();
      Object.keys(model).forEach(function (k) {
        expect(db.getModel(k)).to.exist;
      });
    });

    it('throw an exception if empty string', function () {
      var conn = db.connect();
      expect(function () {
        db.getModel('');
      }).to.throw(Error);
    });
  });
});
