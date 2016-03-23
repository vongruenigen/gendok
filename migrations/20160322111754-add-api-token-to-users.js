'use strict';

module.exports = {
  up: function (queryInterface, seq) {
    return queryInterface.addColumn('Users', 'apiToken', seq.STRING);
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('Users', 'apiToken');
  }
};
