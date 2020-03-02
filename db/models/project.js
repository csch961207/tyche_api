'use strict';
module.exports = (sequelize, DataTypes) => {
  const project = sequelize.define('project', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true
    },
    projectName: DataTypes.STRING,
    name: DataTypes.STRING,
    creatorId: DataTypes.STRING,
    creationTime: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    isPublic: DataTypes.BOOLEAN,
    isActive: DataTypes.BOOLEAN,
    desc: DataTypes.TEXT,
    templateIds: DataTypes.TEXT,
    environment: DataTypes.INTEGER,
    version: DataTypes.INTEGER,
    build: DataTypes.INTEGER,
  }, {
    timestamps: false
  });
  project.associate = function(models) {
    // associations can be defined here
  };
  return project;
};