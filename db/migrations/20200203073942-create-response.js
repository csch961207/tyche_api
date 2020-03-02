'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('responses', {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV1,
        unique: true,
        primaryKey: true,
        type: Sequelize.UUID
      },
      data: {
        type: Sequelize.STRING
      },
      msg: {
        type: Sequelize.STRING
      },
      code: {
        type: Sequelize.STRING
      },
      projectId: {
        type: Sequelize.STRING
      },
      templateId: {
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
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('responses');
  }
};