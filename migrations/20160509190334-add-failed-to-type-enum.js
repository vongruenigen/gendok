'use strict';

module.exports = {
  up: function (queryInterface, seq) {
    return queryInterface.sequelize.query("ALTER TYPE \"enum_Jobs_state\" ADD VALUE 'failed';");
  },

  down: function (queryInterface, seq) {
    /* Don't remove any values from the enum, otherwise we could have "invalid"
       entries in the database which would lead to big problems... */
  }
};
