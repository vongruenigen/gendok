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
var db = require('../db');

/**
 * Creates the template model and connects it to the given database.
 *
 * @param {Sequelize} The database connection.
 * @return The newly created model.
 */
module.exports = function (seq) {
  var attributes = {
    type: {
      type: sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    body: {
      type: sequelize.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    userId: {
      type: sequelize.INTEGER,
      allowNull: false,
      validate: {
        userExists: function () {
          if ((this.userId != null) && (this.userId != '')) {
            console.log('userId is set:');
            console.log(db.getModel('User').findById(this.userId));
          } else {
            console.log('userId is not set!')
          }
        }
      }
    }
  };

  var options = {
    classMethods: {
      associate: function (models) {
        models.Template.belongsTo(models.User);
      }
    }
  };

  return seq.define('Template', attributes, options);
};
