/**
 * PSIT4 FS2016 - gendok
 *
 * Authors: Dirk von Grünigen, Tobias Huonder, Simon Müller,
 *          Martin Weilenmann, Aurelio Malacarne, Hannes Klauser,
 *          Benjamin Contreras
 *
 */

'use strict';

var sequelize = require('sequelize');

/**
 * Creates the model and connects it to the given database.
 *
 * @param {Sequelize} The database connection.
 * @return The newly created model.
 */
module.exports = function (db) {
  var attributes = {
    isAdmin:      sequelize.BOOLEAN,
    name:         sequelize.STRING,
    email:        sequelize.STRING,
    passwordHash: sequelize.STRING
  };

  var options = {
    classMethods: {
      associate: function(models) {
        this.hasMany(models.Template);
      }
    }
  };

  return db.define('User', attributes, options);
};
