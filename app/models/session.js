
module.exports = (sequelize, DataTypes) => {
  const Session = sequelize.define(
    'Session',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      auth_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
      },
      device_id: {
        type: DataTypes.STRING,
        allowNull: false
      },
      device_token: {
        type: DataTypes.STRING,
        allowNull: false
      },
      device_type: {
        type: DataTypes.STRING,
        allowNull: false
      },
      jwt_token: {
        type: DataTypes.STRING(500),
        allowNull: false
      }
    },
    {
      tableName: 'session',
      timestamps: false,
      paranoid: true,
      underscored: true,
      freezeTableName: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at'
    }
  );

  Session.associate = (models) => {
    Session.belongsTo(models.Auth, { foreignKey: 'auth_id' });
  };

  return Session;
};
