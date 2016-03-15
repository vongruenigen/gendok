'use strict';
module.exports = {
  up: function(queryInterface, db) {
    return queryInterface.createTable('Templates', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: db.INTEGER
      },
      type: {
        type: db.STRING
      },
      template: {
        type: db.TEXT
      },
      userId: {
        type: db.INTEGER,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: db.DATE
      },
      updatedAt: {
        allowNull: false,
        type: db.DATE
      }
    });
  },
  down: function(queryInterface, db) {
    return queryInterface.dropTable('Templates');
  }
};
