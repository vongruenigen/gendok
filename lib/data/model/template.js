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

module.exports = function (db) {
  var attributes = {
    type:     sequelize.STRING,
    template: sequelize.TEXT,
    userId:   sequelize.INTEGER
  };

  var template = db.define('template', attributes, {
    classMethods: {
      associate: function (models) {
        models.template.belongsTo(models.user);
      }
    }
  });

  return template;
};
