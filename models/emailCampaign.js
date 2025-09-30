const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EmailCampaign = sequelize.define('EmailCampaign', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  subject: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  send_type: {
    type: DataTypes.ENUM('SINGLE', 'GROUP'),
    allowNull: false,
    defaultValue: 'GROUP',
  },
  email_group_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'EmailGroup',
      key: 'id'
    }
  },
  recipient_email_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Email',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'FAILED'),
    allowNull: false,
    defaultValue: 'DRAFT',
  },
  scheduled_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  sent_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  total_recipients: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  sent_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  failed_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 'EmailCampaign',
  timestamps: false,
});

module.exports = EmailCampaign;
