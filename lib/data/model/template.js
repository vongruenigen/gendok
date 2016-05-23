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
    additionalCss: sequelize.TEXT,

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

        notEmpty: {
          msg: 'may not be empty'
        }
      }
    },

    body: {
      type: sequelize.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'may not be empty'
        }
      }
    },
    name: {
      type: sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'may not be empty'
        }
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
    },

    paperFormat: {
      type: sequelize.STRING,
      allowNull: false,
      defaultValue: 'A4',
      validate: {
        is: /^[a]{1}[3-5]{1}$/i,
        notEmpty: {
          msg: 'may not be empty'
        }
      }
    },

    paperMargin: {
      type: sequelize.STRING,
      allowNull: false,
      defaultValue: '0px',
      validate: {
        is: /^[0-9]+((px)|(cm))$/i,
        notEmpty: {
          msg: 'may not be empty'
        }
      }
    },

    headerHeight: {
      type: sequelize.STRING,
      allowNull: false,
      defaultValue: '0px',
      validate: {
        is: /^[0-9]+((px)|(cm))$/i,
        notEmpty: {
          msg: 'may not be empty'
        }
      }
    },

    footerHeight: {
      type: sequelize.STRING,
      allowNull: false,
      defaultValue: '0px',
      validate: {
        is: /^[0-9]+((px)|(cm))$/i,
        notEmpty: {
          msg: 'may not be empty'
        }
      }
    }
  };

  var options = {
    classMethods: {
      associate: function (models) {
        models.Template.belongsTo(models.User, {foreignKey: 'userId'});
        models.Template.hasOne(models.Job, {foreignKey: 'templateId'});
      }
    },

    instanceMethods: {
      /**
       * Returns a sanitized version of the Template. Only contains id, type and
       * body, but no userId.
       *
       * @return The sanitized Template as JavaScript object.
       */
      toPublicObject: function () {
        return {
          id: this.id,
          type: this.type,
          name: this.name,
          body: this.body,
          createdAt: this.createdAt ? this.createdAt.toISOString() : null,
          updatedAt: this.updatedAt ? this.updatedAt.toISOString() : null,
          paperFormat: this.paperFormat,
          paperMargin: this.paperMargin,
          headerHeight: this.headerHeight,
          footerHeight: this.footerHeight,
          additionalCss: this.additionalCss
        };
      }
    }
  };

  return seq.define('Template', attributes, options);
};
