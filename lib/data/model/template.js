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
    type: {
      type: sequelize.STRING,
      validate: {
        notEmpty: true
      }
    },
    body: {
      type: sequelize.TEXT,
      validate: {
        notEmpty: true
      }
    },
    userId: sequelize.INTEGER
  };

  var options = {
    classMethods: {
      associate: function (models) {
        models.Template.belongsTo(models.User);
      }
    }
  };

  return db.define('Template', attributes, options);
};
