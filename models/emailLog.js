const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EmailLog = sequelize.define('EmailLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  campaign_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'EmailCampaign',
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
    type: DataTypes.ENUM('SENT', 'DELIVERED', 'BOUNCED', 'FAILED', 'OPENED', 'CLICKED'),
    allowNull: false,
  },
  error_message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  sent_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  delivered_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  opened_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  clicked_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 'EmailLog',
  timestamps: false,
});

module.exports = EmailLog;
