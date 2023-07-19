const helper = require('../utils/helper');

module.exports = (sequelize, DataTypes) => {
  const Otp = sequelize.define(
    'Otp',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: helper.genUUID()
      },
      user: {
        type: DataTypes.STRING,
        allowNull: false
      },
      otp: {
        type: DataTypes.STRING(500),
        allowNull: false
      }
    },
    {
      tableName: 'otp',
      timestamps: true,
      paranoid: true,
      underscored: true,
      freezeTableName: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at'
    }
  );

  return Otp;
};
