const { createTransporter, validateEmailConfig } = require('../config/email');
const { EmailLog, EmailCampaign } = require('../models');
const { Op } = require('sequelize');

// Validate email address
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Send single email
const sendEmail = async (to, subject, content, campaignId = null, emailId = null) => {
  try {
    if (!validateEmailConfig()) {
      throw new Error('Email configuration is invalid');
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: to,
      subject: subject,
      html: content,
    };

    const result = await transporter.sendMail(mailOptions);
    
    // Log email if campaign and email IDs are provided
    if (campaignId && emailId) {
      await EmailLog.create({
        campaign_id: campaignId,
        email_id: emailId,
        status: 'SENT',
        sent_at: new Date(),
        created_at: new Date()
      });
    }

    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    
    // Log failed email if campaign and email IDs are provided
    if (campaignId && emailId) {
      await EmailLog.create({
        campaign_id: campaignId,
        email_id: emailId,
        status: 'FAILED',
        error_message: error.message,
        created_at: new Date()
      });
    }
    
    throw error;
  }
};

// Send bulk emails with rate limiting
const sendBulkEmails = async (emails, subject, content, campaignId) => {
  const results = {
    sent: 0,
    failed: 0,
    errors: []
  };

  // Process emails in batches to avoid overwhelming the SMTP server
  const batchSize = 10;
  const batches = [];
  
  for (let i = 0; i < emails.length; i += batchSize) {
    batches.push(emails.slice(i, i + batchSize));
  }

  for (const batch of batches) {
    const promises = batch.map(async (email) => {
      try {
        await sendEmail(email.email_address, subject, content, campaignId, email.id);
        results.sent++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          email: email.email_address,
          error: error.message
        });
      }
    });

    await Promise.all(promises);
    
    // Add delay between batches to respect rate limits
    if (batches.indexOf(batch) < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
    }
  }

  return results;
};

// Parse CSV content
const parseCSVContent = (content) => {
  const lines = content.split('\n');
  const emails = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line && isValidEmail(line)) {
      emails.push({
        email_address: line.toLowerCase().trim(),
        source_type: 'CSV',
        created_at: new Date()
      });
    }
  }
  
  return emails;
};

// Parse Excel content
const parseExcelContent = (data) => {
  const emails = [];
  
  data.forEach((row, index) => {
    const email = row.email || row.Email || row.EMAIL;
    if (email && isValidEmail(email)) {
      emails.push({
        email_address: email.toLowerCase().trim(),
        source_type: 'EXCEL',
        created_at: new Date()
      });
    }
  });
  
  return emails;
};

// Get email statistics
const getEmailStats = async (userId, startDate = null, endDate = null) => {
  const whereClause = { user_id: userId };
  
  if (startDate && endDate) {
    whereClause.created_at = {
      [Op.between]: [startDate, endDate]
    };
  }

  const stats = await EmailLog.findAll({
    where: {
      campaign_id: {
        [Op.in]: await EmailCampaign.findAll({
          where: { user_id: userId },
          attributes: ['id']
        }).then(campaigns => campaigns.map(c => c.id))
      }
    },
    attributes: [
      'status',
      [EmailLog.sequelize.fn('COUNT', EmailLog.sequelize.col('id')), 'count']
    ],
    group: ['status'],
    raw: true
  });

  return stats;
};

// Clean up old email logs (for maintenance)
const cleanupOldLogs = async (daysOld = 90) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const deletedCount = await EmailLog.destroy({
    where: {
      created_at: {
        [Op.lt]: cutoffDate
      }
    }
  });

  return deletedCount;
};

module.exports = {
  isValidEmail,
  sendEmail,
  sendBulkEmails,
  parseCSVContent,
  parseExcelContent,
  getEmailStats,
  cleanupOldLogs
};
