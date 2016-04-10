'use strict';

module.exports = {
  up: function (queryInterface, seq) {
    return queryInterface.addColumn('Jobs', 'format', seq.STRING);
  },

  down: function (queryInterface, seq) {
    return queryInterface.removeColumn('Job', 'format');
  }
};
