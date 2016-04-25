'use strict';

module.exports = {
  up: function (queryInterface, seq) {
    return queryInterface.addColumn('Templates', 'name', seq.STRING);
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('Templates', 'name');
  }
};
