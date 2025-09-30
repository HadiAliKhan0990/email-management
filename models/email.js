const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Email = sequelize.define('Email', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email_address: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  source_type: {
    type: DataTypes.ENUM('MANUAL', 'CSV', 'EXCEL', 'TOWNTICKS'),
    allowNull: false,
    defaultValue: 'MANUAL',
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'UNSUBSCRIBED'),
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
  tableName: 'Email',
  timestamps: false,
});

module.exports = Email;
