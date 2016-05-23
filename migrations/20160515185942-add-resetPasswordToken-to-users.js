'use strict';

module.exports = {
  up: function (queryInterface, db) {
    return queryInterface.addColumn('Users', 'resetPasswordToken', {type: db.STRING});
  },

  down: function (queryInterface, db) {
    return queryInterface.removeColumn('Users', 'resetPasswordToken');
  }
};
