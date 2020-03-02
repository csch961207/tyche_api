'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('projects', {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV1,
        unique: true,
        primaryKey: true,
        type: Sequelize.UUID
      },
      projectName: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      creatorId: {
        type: Sequelize.STRING
      },
      creationTime: {
        allowNull: false,
        defaultValue: Sequelize.NOW,
        type: Sequelize.DATE
      },
      isPublic: {
        type: Sequelize.BOOLEAN
      },
      isActive: {
        type: Sequelize.BOOLEAN
      },
      desc: {
        type: Sequelize.TEXT
      },
      templateIds: {
        type: Sequelize.TEXT
      },
      environment: {
        type: Sequelize.INTEGER
      },
      version: {
        type: Sequelize.INTEGER
      },
      build: {
        type: Sequelize.INTEGER
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('projects');
  }
};