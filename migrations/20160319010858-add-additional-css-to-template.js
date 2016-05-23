'use strict';

module.exports = {
  up: function (queryInterface, db) {
    return queryInterface.addColumn('Templates', 'additionalCss', {type: db.TEXT});
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('Templates', 'additionalCss');
  }
};
