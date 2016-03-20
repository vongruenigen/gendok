'use strict';
module.exports = {
  up: function(queryInterface, db) {
    return queryInterface.createTable('Jobs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: db.INTEGER
      },
      templateId: {
        type: db.INTEGER,
        allowNull: false
      },
      payload: {
        type: db.JSON
      },
      state: {
        type: db.ENUM('pending', 'active', 'finished'),
        allowNull: false,
        defaultValue: 'pending'
      },
      result: {
        type: db.BLOB
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
    return queryInterface.dropTable('Jobs');
  }
};
