const { USER_TYPE } = require('../constant/auth');

module.exports = (sequelize, DataTypes) => {
    const Auth = sequelize.define(
      'Auth',
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          allowNull: false
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true
        },
        password: {
          type: DataTypes.STRING,
          allowNull: true
        },
        is_email_verified: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        USER_TYPE: {
          type: DataTypes.ENUM(
            USER_TYPE.ADMIN,
            USER_TYPE.COMPANY
          ),
          allowNull: false,
          defaultValue: USER_TYPE.ADMIN
        },
        country_code: {
          type: DataTypes.STRING,
          allowNull: true
        },
        phone_no: {
          type: DataTypes.BIGINT,
          allowNull: false
        },
        is_phone_verified: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        status: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: 0
        }
      },
      {
        tableName: 'auth',
        timestamps: false,
        paranoid: true,
        freezeTableName: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at'
      }
    );
  
    Auth.associate = (models) => {
      Auth.hasOne(models.Session, { foreignKey: 'auth_id' });
    };
  
    return Auth;
  };
  