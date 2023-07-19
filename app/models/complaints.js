const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const complaints = sequelize.define(
    'complaints',
    {
      complaint_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      complaint_category: {
        type: DataTypes.STRING,
        allowNull: false
      },
      department_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      user_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false
      },
      phone_no: {
        type: DataTypes.STRING,
        allowNull: false
      },
      district: {
        type: DataTypes.STRING,
        allowNull: false
      },
      addressLine1: {
        type: DataTypes.STRING,
        allowNull: false
      },
      addressLine2: {
        type: DataTypes.STRING,
        allowNull: false
      },
      supporting_document: {
        type: DataTypes.BLOB,
        allowNull: false
      },
      comment: {
        type: DataTypes.STRING,
        allowNull: false
      }
    },
    {
      tableName: 'complaints',
      timestamps: false,
      paranoid: true,
      freezeTableName: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at'
    }
  );

  return complaints;
};
