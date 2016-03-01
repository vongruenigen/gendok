'use strict';
module.exports = {
  up: function(queryInterface, db) {
    return queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: db.INTEGER
      },
      isAdmin: {
        type: db.BOOLEAN
      },
      name: {
        type: db.STRING
      },
      email: {
        type: db.STRING
      },
      passwordHash: {
        type: db.STRING
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
    return queryInterface.dropTable('Users');
  }
};
