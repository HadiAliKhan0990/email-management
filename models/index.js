'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Import email service models
const EmailGroup = require('./emailGroup');
const Email = require('./email');
const EmailGroupMember = require('./emailGroupMember');
const EmailCampaign = require('./emailCampaign');
const EmailLog = require('./emailLog');

// Add models to db object
db.EmailGroup = EmailGroup;
db.Email = Email;
db.EmailGroupMember = EmailGroupMember;
db.EmailCampaign = EmailCampaign;
db.EmailLog = EmailLog;

// Set up associations (no user relations, only internal email service relations)
EmailGroup.belongsToMany(Email, { 
  through: EmailGroupMember, 
  foreignKey: 'email_group_id',
  otherKey: 'email_id',
  as: 'emails'
});

Email.belongsToMany(EmailGroup, { 
  through: EmailGroupMember, 
  foreignKey: 'email_id',
  otherKey: 'email_group_id',
  as: 'groups'
});

EmailGroup.hasMany(EmailCampaign, { 
  foreignKey: 'email_group_id',
  as: 'campaigns'
});

EmailCampaign.belongsTo(EmailGroup, { 
  foreignKey: 'email_group_id',
  as: 'group'
});

EmailCampaign.hasMany(EmailLog, { 
  foreignKey: 'campaign_id',
  as: 'logs'
});

Email.hasMany(EmailLog, { 
  foreignKey: 'email_id',
  as: 'logs'
});

EmailLog.belongsTo(EmailCampaign, { 
  foreignKey: 'campaign_id',
  as: 'campaign'
});

EmailLog.belongsTo(Email, { 
  foreignKey: 'email_id',
  as: 'email'
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
