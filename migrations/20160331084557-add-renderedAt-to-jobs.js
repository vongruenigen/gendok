'use strict';

module.exports = {
  up: function (queryInterface, db) {
    return queryInterface.addColumn('Jobs', 'renderedAt', {type: db.DATE});
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('Jobs', 'renderedAt');
  }
};
