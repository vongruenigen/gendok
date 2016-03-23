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
var availableTypes = require('../../compiler').available;

/**
 * Creates the template model and connects it to the given database.
 *
 * @param {Sequelize} seq The database connection.
 * @return The newly created model.
 */
module.exports = function (seq) {
  var attributes = {
    type: {
      type: sequelize.STRING,
      allowNull: false,
      validate: {
        /**
         * Validates that an actual compiler exists for the specified type.
         */
        ensureAvailableType: function (compilerType, next) {
          if (compilerType && !(compilerType in availableTypes)) {
            next(new Error('Type ' + compilerType + ' is not available'));
          } else {
            next();
          }
        },

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
        userExists: function (userId, next) {
          var User = seq.models.User;

          if (!this.userId) {
            next(new Error('userId is not set!'));
          } else {
            User.findById(this.userId).then(function (user) {
              var error = !user ? new Error('invalid userId') : null;
              next(error);
            });
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
