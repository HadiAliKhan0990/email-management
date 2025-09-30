const { EmailCampaign, EmailGroup, Email, EmailLog } = require('../models');
const { validationResult } = require('express-validator');
const { HTTP_STATUS_CODE } = require('../utils/httpStatus');
const nodemailer = require('nodemailer');

// Create email campaign (supports SINGLE recipient or GROUP)
const createCampaign = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ errors: errors.array() });
  }

  try {
    const { subject, content, email_group_id, recipient_email_address, recipient_email_id, scheduled_at } = req.body;
    const user_id = req.user.id;

    // Determine send type based on what was provided
    const send_type = (recipient_email_address || recipient_email_id) ? 'SINGLE' : 'GROUP';

    let total_recipients = 0;
    let resolvedRecipientEmailId = null;

    if (send_type === 'GROUP') {
      // ---- GROUP MODE ----
      // Verify group belongs to user and has active emails
      const group = await EmailGroup.findOne({ 
        where: { id: email_group_id, user_id },
        include: [{
          model: Email,
          as: 'emails',
          through: { attributes: [] },
          where: { status: 'ACTIVE' }
        }]
      });

      if (!group) {
        return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
          message: 'Email group not found or no active emails'
        });
      }

      total_recipients = group.emails.length;
    } else {
      // ---- SINGLE MODE ----
      let recipientEmail;

      if (recipient_email_id) {
        // Look up email by ID directly
        recipientEmail = await Email.findOne({
          where: { id: recipient_email_id, user_id }
        });

        if (!recipientEmail) {
          return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
            message: 'Recipient email not found'
          });
        }
      } else {
        // Look up email by address, or create it if it doesn't exist
        recipientEmail = await Email.findOne({
          where: { email_address: recipient_email_address.toLowerCase().trim(), user_id }
        });

        if (!recipientEmail) {
          // Auto-create the email record for convenience
          recipientEmail = await Email.create({
            email_address: recipient_email_address.toLowerCase().trim(),
            user_id,
            source_type: 'MANUAL',
            status: 'ACTIVE',
            created_at: new Date(),
          });
        }
      }

      if (recipientEmail.status !== 'ACTIVE') {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          message: 'Recipient email is not active (may be unsubscribed or inactive)'
        });
      }

      resolvedRecipientEmailId = recipientEmail.id;
      total_recipients = 1;
    }

    const campaign = await EmailCampaign.create({
      subject,
      content,
      user_id,
      send_type,
      email_group_id: send_type === 'GROUP' ? email_group_id : null,
      recipient_email_id: send_type === 'SINGLE' ? resolvedRecipientEmailId : null,
      status: scheduled_at ? 'SCHEDULED' : 'DRAFT',
      scheduled_at: scheduled_at || null,
      total_recipients,
      created_at: new Date(),
    });

    res.status(HTTP_STATUS_CODE.CREATED).json({
      message: 'Email campaign created successfully',
      campaign
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      message: 'Error creating campaign',
    });
  }
};

// Get all campaigns for a user
const getAllCampaigns = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { status, page = 1, limit = 20 } = req.query;

    let where = { user_id };
    if (status) where.status = status;

    const offset = (page - 1) * limit;

    const campaigns = await EmailCampaign.findAndCountAll({
      where,
      include: [
        {
          model: EmailGroup,
          as: 'group',
          attributes: ['id', 'name'],
          required: false
        },
        {
          model: Email,
          as: 'recipientEmail',
          attributes: ['id', 'email_address'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(HTTP_STATUS_CODE.OK).json({
      message: 'Campaigns retrieved successfully',
      campaigns: campaigns.rows,
      pagination: {
        total: campaigns.count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(campaigns.count / limit)
      }
    });
  } catch (error) {
    console.error('Error retrieving campaigns:', error);
    res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      message: 'Error retrieving campaigns',
    });
  }
};

// Get single campaign
const getCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const campaign = await EmailCampaign.findOne({
      where: { id, user_id },
      include: [
        {
          model: EmailGroup,
          as: 'group',
          attributes: ['id', 'name', 'total_emails'],
          required: false
        },
        {
          model: Email,
          as: 'recipientEmail',
          attributes: ['id', 'email_address'],
          required: false
        },
        {
          model: EmailLog,
          as: 'logs',
          include: [{
            model: Email,
            as: 'email',
            attributes: ['email_address']
          }],
          attributes: ['status', 'sent_at', 'delivered_at', 'opened_at', 'error_message']
        }
      ]
    });

    if (!campaign) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({ 
        message: 'Campaign not found' 
      });
    }

    res.status(HTTP_STATUS_CODE.OK).json({
      message: 'Campaign retrieved successfully',
      campaign
    });
  } catch (error) {
    console.error('Error retrieving campaign:', error);
    res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({ 
      message: 'Error retrieving campaign' 
    });
  }
};

// Update campaign
const updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    const { subject, content, scheduled_at, status } = req.body;

    const campaign = await EmailCampaign.findOne({ where: { id, user_id } });
    if (!campaign) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({ 
        message: 'Campaign not found' 
      });
    }

    // Don't allow updates to sent campaigns
    if (campaign.status === 'SENT') {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ 
        message: 'Cannot update sent campaigns' 
      });
    }

    await campaign.update({
      subject: subject || campaign.subject,
      content: content || campaign.content,
      scheduled_at: scheduled_at !== undefined ? scheduled_at : campaign.scheduled_at,
      status: status || campaign.status,
      updated_at: new Date()
    });

    res.status(HTTP_STATUS_CODE.OK).json({ 
      message: 'Campaign updated successfully',
      campaign 
    });
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({ 
      message: 'Error updating campaign' 
    });
  }
};

// Send campaign (supports both SINGLE and GROUP modes)
const sendCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Build includes based on send type — we fetch the campaign first to check
    const campaign = await EmailCampaign.findOne({
      where: { id, user_id },
      include: [
        {
          model: EmailGroup,
          as: 'group',
          required: false,
          include: [{
            model: Email,
            as: 'emails',
            through: { attributes: [] },
            where: { status: 'ACTIVE' },
            required: false
          }]
        },
        {
          model: Email,
          as: 'recipientEmail',
          required: false
        }
      ]
    });

    if (!campaign) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({ 
        message: 'Campaign not found' 
      });
    }

    if (campaign.status === 'SENT') {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ 
        message: 'Campaign already sent' 
      });
    }

    // Determine the list of recipients
    let recipients = [];

    if (campaign.send_type === 'SINGLE') {
      // Single recipient mode
      if (!campaign.recipientEmail) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ 
          message: 'Single recipient email not found or has been deleted' 
        });
      }
      if (campaign.recipientEmail.status !== 'ACTIVE') {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ 
          message: 'Recipient email is not active' 
        });
      }
      recipients = [campaign.recipientEmail];
    } else {
      // Group mode
      if (!campaign.group || !campaign.group.emails || campaign.group.emails.length === 0) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ 
          message: 'Email group has no active recipients' 
        });
      }
      recipients = campaign.group.emails;
    }

    // Update campaign status to sending
    await campaign.update({ 
      status: 'SENDING',
      updated_at: new Date()
    });

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    let sentCount = 0;
    let failedCount = 0;

    // Send emails to all recipients (1 for single, many for group)
    for (const email of recipients) {
      try {
        await transporter.sendMail({
          from: process.env.FROM_EMAIL,
          to: email.email_address,
          subject: campaign.subject,
          html: campaign.content,
        });

        // Log successful send
        await EmailLog.create({
          campaign_id: campaign.id,
          email_id: email.id,
          status: 'SENT',
          sent_at: new Date(),
          created_at: new Date()
        });

        sentCount++;
      } catch (error) {
        console.error(`Error sending to ${email.email_address}:`, error);
        
        // Log failed send
        await EmailLog.create({
          campaign_id: campaign.id,
          email_id: email.id,
          status: 'FAILED',
          error_message: error.message,
          created_at: new Date()
        });

        failedCount++;
      }
    }

    // Update campaign with final status
    await campaign.update({
      status: 'SENT',
      sent_at: new Date(),
      sent_count: sentCount,
      failed_count: failedCount,
      updated_at: new Date()
    });

    res.status(HTTP_STATUS_CODE.OK).json({
      message: campaign.send_type === 'SINGLE' 
        ? 'Email sent successfully to single recipient' 
        : 'Campaign sent successfully to group',
      campaign: {
        id: campaign.id,
        send_type: campaign.send_type,
        sent_count: sentCount,
        failed_count: failedCount,
        total_recipients: campaign.total_recipients
      }
    });
  } catch (error) {
    console.error('Error sending campaign:', error);
    
    // Update campaign status to failed
    await EmailCampaign.update(
      { status: 'FAILED', updated_at: new Date() },
      { where: { id: req.params.id } }
    );

    res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({ 
      message: 'Error sending campaign' 
    });
  }
};

// Delete campaign
const deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const campaign = await EmailCampaign.findOne({ where: { id, user_id } });
    if (!campaign) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({ 
        message: 'Campaign not found' 
      });
    }

    // Don't allow deletion of sent campaigns
    if (campaign.status === 'SENT') {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ 
        message: 'Cannot delete sent campaigns' 
      });
    }

    // Delete associated logs first
    await EmailLog.destroy({ where: { campaign_id: id } });
    
    // Delete the campaign
    await campaign.destroy();

    res.status(HTTP_STATUS_CODE.OK).json({ 
      message: 'Campaign deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({ 
      message: 'Error deleting campaign' 
    });
  }
};

// Get campaign analytics
const getCampaignAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const campaign = await EmailCampaign.findOne({
      where: { id, user_id },
      include: [{
        model: EmailLog,
        as: 'logs',
        attributes: ['status']
      }]
    });

    if (!campaign) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({ 
        message: 'Campaign not found' 
      });
    }

    const analytics = {
      total_recipients: campaign.total_recipients,
      sent_count: campaign.sent_count,
      failed_count: campaign.failed_count,
      delivery_rate: campaign.total_recipients > 0 ? 
        ((campaign.sent_count / campaign.total_recipients) * 100).toFixed(2) : 0,
      open_count: campaign.logs.filter(log => log.status === 'OPENED').length,
      click_count: campaign.logs.filter(log => log.status === 'CLICKED').length,
      bounce_count: campaign.logs.filter(log => log.status === 'BOUNCED').length
    };

    res.status(HTTP_STATUS_CODE.OK).json({
      message: 'Campaign analytics retrieved successfully',
      analytics
    });
  } catch (error) {
    console.error('Error retrieving campaign analytics:', error);
    res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      message: 'Error retrieving campaign analytics'
    });
  }
};

module.exports = {
  createCampaign,
  getAllCampaigns,
  getCampaign,
  updateCampaign,
  sendCampaign,
  deleteCampaign,
  getCampaignAnalytics
};
