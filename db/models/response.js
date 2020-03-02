'use strict';
module.exports = (sequelize, DataTypes) => {
  const response = sequelize.define('response', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true
    },
    data: DataTypes.TEXT,
    msg: DataTypes.TEXT,
    code: DataTypes.STRING,
    projectId: DataTypes.UUID,
    templateId: DataTypes.UUID,
    creatorId: DataTypes.UUID,
    creationTime: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    isPublic: DataTypes.BOOLEAN
  }, {
    timestamps: false
  });
  response.associate = function(models) {
    // associations can be defined here
  };
  return response;
};