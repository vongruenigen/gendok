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
var crypto = require('crypto');

/**
 * Creates the user model and connects it to the given database.
 *
 * @param {Sequelize} The database connection.
 * @return The newly created model.
 */
module.exports = function (db) {
  var attributes = {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: sequelize.INTEGER
    },
    isAdmin: {
      allowNull: false,
      type: sequelize.BOOLEAN,
      validate: {
        notEmpty: true
      }
    },
    name: {
      allowNull: false,
      type: sequelize.STRING
    },
    email: {
      allowNull: false,
      type: sequelize.STRING,
      isUnique: true,
      validate: {
        isEmail: true
      }
    },
    passwordHash: {
      allowNull: false,
      type: sequelize.STRING,
      validate: {
        notEmpty: true
      }
    },
    apiToken: {
      type: sequelize.STRING,
      defaultValue: function () {
        return crypto.randomBytes(4).toString('hex');
      }
    }
  };

  var options = {
    classMethods: {
      associate: function (models) {
        models.User.hasMany(models.Template, {foreignKey: 'userId'});
      }
    },
    instanceMethods: {
      /**
       * Returns a sanitized version of the Template. Only contains id, type and
       * body, but no userId.
       *
       * @return The sanitized Template as JavaScript object.
       */
      toPublicObject: function (model) {
        return {
          id: this.id,
          isAdmin: this.isAdmin,
          name: this.name,
          email: this.email
        };
      }
    }
  };

  return db.define('User', attributes, options);
};
