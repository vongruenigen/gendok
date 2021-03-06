/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var Sequelize = require('sequelize');
var model = require('./model/');
var logger = require('../logger');
var config = require('../config');
var env = require('../env');
var path = require('path');

// TODO: This is ugly. Ew. This makes code monkey sad :(
// See: https://github.com/sequelize/sequelize/issues/3781
var pg = require('pg');
delete pg.native;

/**
 * Exports functions for establishing/retrieving the databse connection.
 *
 * @type {Object}
 */
module.exports = {
  // Will be set by establishConnection()
  _connection: null,

  /**
   * Establishes the database connection and associates all models with it. It
   * uses the parameters set on the current config.
   *
   * @return The newly created database connection.
   */
  connect: function () {
    if (this.isConnected()) {
      logger.warn('connect()', 'database connection already established, skipping');
      return this.getConnection();
    }

    var configObj = {
      dialect: config.get('dialect'),
      storage: config.get('storage'),
      logging: function () { logger.debug.apply(logger, arguments); },
    };

    var seq = new Sequelize(
      config.get('database'),
      config.get('username'),
      config.get('password'),
      configObj
    );

    this._connection = {sequelize: seq};

    this._loadModels(this._connection);

    logger.info('connect()', 'established datbase connection to ' + config.get('database'));

    return this._connection;
  },

  /**
   * Returns all models in an object where the key is their name
   * (be aware that model names are uppercase) and the model object
   * as the value.
   *
   * @return {Object} Object containing all models
   */
  getAllModels: function () {
    if (!this.isConnected()) {
      throw new Error('no open database connection');
    }

    // TODO We should copy the object here instead of returning it
    return this._connection.models;
  },

  /**
   * Get the Model mathing the given Name.
   *
   * @param {name} The name of the model.
   *
   * @return The desired model
   */
  getModel: function (name) {
    if (!this.isConnected()) {
      throw new Error('no open database connection');
    }

    if (!name || name === '') {
      throw new Error('name parameter is missing or empty string');
    }

    return this._connection.models[name];
  },

  /**
   * Disconnects the current database connection. If no connection has been
   * established this function is a noop.
   */
  disconnect: function () {
    if (this.isConnected()) {
      this._connection.sequelize.close();
      this._connection = null;
    }
  },

  /**
   * Returns true if a database connection has already been established,
   * otherwise false.
   *
   * @return True if connection has been established.
   */
  isConnected: function () {
    return !!this._connection;
  },

  /**
   * Returns the database connection. An error will be thrown if no connection
   * has been established before via establishConnection().
   *
   * @return The database connection.
   */
  getConnection: function () {
    return this._connection;
  },

  /**
   * Loads all models and associates them with the given database connection.
   *
   * @param {Sequelize} The database connection.
   */
  _loadModels: function (connection) {
    connection.models = {};

    // Bit clumsy, but seems to be the way to do it, see:
    // https://github.com/sequelize/express-example/blob/master/models/index.js
    Object.keys(model).forEach(function (k) {
      //Use the lower-case model name since the linux fs if is case-sensitive
      var p = path.join(__dirname, 'model', k.toLowerCase());
      var m = connection.sequelize.import(p);
      connection.models[m.name] = m;
    });

    Object.keys(connection.models).forEach(function (k) {
      connection.models[k].associate(connection.models);
    });
  }
};
