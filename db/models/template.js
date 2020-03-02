'use strict';
module.exports = (sequelize, DataTypes) => {
  const template = sequelize.define('template', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true
    },
    templateName: DataTypes.STRING,
    name: DataTypes.STRING,
    creatorId: DataTypes.STRING,
    creationTime: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    isPublic: DataTypes.BOOLEAN,
    isActive: DataTypes.BOOLEAN,
    desc: DataTypes.STRING,
    type: DataTypes.INTEGER,
    fields: DataTypes.TEXT,
    environment: DataTypes.INTEGER,
    version: DataTypes.INTEGER,
    build: DataTypes.INTEGER,
  }, {
    timestamps: false
  });
  template.associate = function(models) {
    // associations can be defined here
  };
  return template;
};