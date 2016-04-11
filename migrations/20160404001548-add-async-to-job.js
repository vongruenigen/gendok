'use strict';

module.exports = {
  up: function (queryInterface, seq) {
    return queryInterface.addColumn('Jobs', 'async', seq.BOOLEAN);
  },

  down: function (queryInterface, seq) {
    return queryInterface.removeColumn('Job', 'async');
  }
};
