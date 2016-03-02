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
 * Creates the template model and connects it to the given database.
 *
 * @param {Sequelize} The database connection.
 * @return The newly created model.
 */
module.exports = function (db) {
  var attributes = {
    type:     sequelize.STRING,
    template: sequelize.TEXT,
    userId:   sequelize.INTEGER
  };

  var options = {
    classMethods: {
      associate: function (models) {
        models.template.belongsTo(models.user);
      }
    }
  };

  return db.define('template', attributes, options);
};