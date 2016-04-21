'use strict';

module.exports = {
  up: function (queryInterface, seq) {
    return queryInterface.addColumn('Templates', 'paperFormat', seq.STRING)
    .then(function () {
      return queryInterface.addColumn('Templates', 'paperMargin', seq.STRING)
      .then(function () {
        return queryInterface.addColumn('Templates', 'headerHeight', seq.STRING)
        .then(function () {
          return queryInterface.addColumn('Templates', 'footerHeight', seq.STRING);
        });
      });
    });
  },

  down: function (queryInterface, seq) {
    return queryInterface.removeColumn('Templates', 'footerHeight')
    .then(function () {
      return queryInterface.removeColumn('Templates', 'headerHeight')
      .then(function () {
        return queryInterface.removeColumn('Templates', 'paperMargin')
        .then(function () {
          return queryInterface.removeColumn('Templates', 'paperFormat');
        });
      });
    });
  }
};
