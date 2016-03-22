'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.renameColumn('Templates', 'template', 'body');
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.renameColumn('Templates', 'body', 'template');
  }
};
