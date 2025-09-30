const nodemailer = require('nodemailer');

// Email configuration
const emailConfig = {
  // SMTP Configuration
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  },
  
  // Email settings
  from: process.env.FROM_EMAIL || 'noreply@townticks.com',
  replyTo: process.env.REPLY_TO_EMAIL || 'support@townticks.com',
  
  // Rate limiting
  rateLimit: {
    maxEmailsPerHour: parseInt(process.env.MAX_EMAILS_PER_HOUR) || 100,
    maxEmailsPerDay: parseInt(process.env.MAX_EMAILS_PER_DAY) || 1000,
  },
  
  // File upload settings
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ],
    uploadPath: './uploads/'
  }
};

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransporter(emailConfig.smtp);
};

// Validate email configuration
const validateEmailConfig = () => {
  const required = ['SMTP_USER', 'SMTP_PASS', 'FROM_EMAIL'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn(`Missing email configuration: ${missing.join(', ')}`);
    return false;
  }
  
  return true;
};

module.exports = {
  emailConfig,
  createTransporter,
  validateEmailConfig
};
