'use strict';

module.exports = {
  up: function (queryInterface, seq) {
    return queryInterface.addColumn('Users', 'salt', seq.STRING);
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('Users', 'salt');
  }
};
