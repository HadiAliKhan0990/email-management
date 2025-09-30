const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EmailGroupMember = sequelize.define('EmailGroupMember', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email_group_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'EmailGroup',
      key: 'id'
    }
  },
  email_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Email',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
    allowNull: false,
    defaultValue: 'ACTIVE',
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 'EmailGroupMember',
  timestamps: false,
});

module.exports = EmailGroupMember;
