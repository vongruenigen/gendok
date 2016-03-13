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
var env = require('../env');
var path = require('path');

/**
 * Exports functions for establishing/retrieving the databse connection.
 *
 * @type {Object}
 */
module.exports = {
  // Will be set by establishConnection()
  _connection: null,

  /**
   * Establishes the database connection and associates all models with it.
   *
   * @param {Config} The config object.
   *
   * @return The newly created database connection.
   */
  connect: function (config) {
    if (!config) {
      throw new Error('config param is missing');
    }

    if (this.isConnected()) {
      logger.warn('connect()', 'database connection already established, skipping');
      return this.getConnection();
    }

    var configObj = {
      dialect: config.get('dialect'),
      storage: config.get('storage'),
      logging: env.is('development'),
    };

    var seq = new Sequelize(
      config.get('database'),
      config.get('username'),
      config.get('password'),
      configObj
    );

    this._connection = {sequelize: seq};

    this._loadModels(this._connection);

    return this._connection;
  },

  /**
   * Get the Model mathing the given Name
   *
   * @param {name} The name of the model.
   *
   * @return The desired model
   */
   getModel: function (name) {
     if (!name || name === '') {
       throw new Error('name parameter is missing or empty string');
     }
     return this._connection[name];
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
    // Bit clumsy, but seems to be the way to do it, see:
    // https://github.com/sequelize/express-example/blob/master/models/index.js
    Object.keys(model).forEach(function (k) {
      var m = connection.sequelize.import(path.join(__dirname, 'model', k));
      connection[m.name] = m;
    });

    Object.keys(connection).forEach(function (k) {
      // Setup associations if necessary
      if ('associate' in connection[k]) {
        connection[k].associate(connection);
      }
    });
  }
};
