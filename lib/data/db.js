/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var Sequelize = require('sequelize'),
    model     = require('./model/'),
    path      = require('path');

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
      // TODO: Logging!
      // console.log('database connection already established, skipping');
      return this.getConnection();
    }

    this._connection = new Sequelize(
      config.get('database'),
      config.get('username'),
      config.get('password'),
      config.toObject()
    );

    this._loadModels(this._connection);

    return this._connection;
  },

  /**
   * Disconnects the current database connection. If no connection has been
   * established this function is a noop.
   */
  disconnect: function () {
    if (this.isConnected()) {
      this._connection.close();
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

    for (var k in model) {
      if (model.hasOwnProperty(k)) {
        var m = connection.import(path.join(__dirname, 'model', k));
        connection.models[k] = m;
      }
    }
  }
};
