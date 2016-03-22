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
 * Creates the job model and connects it to the given database.
 *
 * @param {Sequelize} The database connection.
 * @return The newly created model.
 */
module.exports = function (db) {
  var attributes = {
    templateId: {
      type: sequelize.INTEGER,
      allowNull: false,
      validate: {
        templateExists: function (templateId, next) {
          var Template = db.models.Template;

          if (this.templateId == '') {
            next(new Error('templateId is not set!'));
          } else {
            Template.findById(this.templateId).then(function (template) {
              var error = !template ? new Error('invalid templateId') : null;
              next(error);
            });
          }
        }
      }
    },
    payload: {
      type: sequelize.JSON
    },
    state: {
      type: sequelize.ENUM('pending', 'active', 'finished'),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    result: {
      type: sequelize.BLOB
    }
  };

  var options = {
    classMethods: {
      associate: function(models) {
        models.Job.belongsTo(models.Template);
      }
    }
  };

  return db.define('Job', attributes, options);
};
