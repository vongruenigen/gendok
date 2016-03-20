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
    templateId: sequelize.INTEGER,
    payload:    sequelize.JSON,
    state:      {
        type: sequelize.ENUM,
        values: ('pending', 'active', 'finished')
    },
    result:     sequelize.BLOB
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
