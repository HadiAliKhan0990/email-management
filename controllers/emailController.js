const { Email, EmailGroup, EmailGroupMember } = require('../models');
const { validationResult } = require('express-validator');
const { HTTP_STATUS_CODE } = require('../utils/httpStatus');
const { Op } = require('sequelize');
const csv = require('csv-parser');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Add single email manually
const addEmail = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ errors: errors.array() });
  }

  try {
    const { email_address } = req.body;
    const user_id = 5;

    // Check if email already exists for this user
    const existingEmail = await Email.findOne({
      where: { email_address, user_id }
    });

    if (existingEmail) {
      return res.status(HTTP_STATUS_CODE.CONFLICT).json({
        message: 'Email already exists'
      });
    }

    const newEmail = await Email.create({
      email_address,
      user_id,
      source_type: 'MANUAL',
      created_at: new Date(),
    });

    res.status(HTTP_STATUS_CODE.CREATED).json({
      message: 'Email added successfully',
      email: newEmail
    });
  } catch (error) {
    console.error('Error adding email:', error);
    res.status(HTTP_STATUS_CODE.INTERNAL_SERVER || 500).json({
      message: 'Error adding email',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Import emails from CSV
const importEmailsFromCSV = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { groupId } = req.body;

    if (!req.file) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        message: 'No file uploaded'
      });
    }

    const emails = [];
    const errors = [];
    let processedCount = 0;

    // Read CSV file
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (row) => {
        const email = row.email || row.Email || row.EMAIL;
        if (email && isValidEmail(email)) {
          emails.push({
            email_address: email.toLowerCase().trim(),
            user_id,
            source_type: 'CSV',
            created_at: new Date()
          });
        } else {
          errors.push(`Invalid email: ${email}`);
        }
      })
      .on('end', async () => {
        try {
          // Bulk insert emails
          const createdEmails = await Email.bulkCreate(emails, {
            ignoreDuplicates: true,
            returning: true
          });

          // Add emails to group if groupId provided
          if (groupId && createdEmails.length > 0) {
            const groupMembers = createdEmails.map(email => ({
              email_group_id: groupId,
              email_id: email.id,
              created_at: new Date()
            }));

            await EmailGroupMember.bulkCreate(groupMembers, {
              ignoreDuplicates: true
            });

            // Update group email count
            await EmailGroup.increment('total_emails', {
              by: createdEmails.length,
              where: { id: groupId }
            });
          }

          // Clean up uploaded file
          fs.unlinkSync(req.file.path);

          res.status(HTTP_STATUS_CODE.OK).json({
            message: 'Emails imported successfully',
            imported_count: createdEmails.length,
            errors: errors.slice(0, 10), // Limit errors to first 10
            total_processed: emails.length
          });
        } catch (error) {
          console.error('Error processing CSV:', error);
          res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
            message: 'Error processing CSV file'
          });
        }
      })
      .on('error', (error) => {
        console.error('Error reading CSV:', error);
        res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
          message: 'Error reading CSV file'
        });
      });
  } catch (error) {
    console.error('Error importing emails from CSV:', error);
    res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      message: 'Error importing emails from CSV',
    });
  }
};

// Import emails from Excel
const importEmailsFromExcel = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { groupId } = req.body;

    if (!req.file) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        message: 'No file uploaded'
      });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const emails = [];
    const errors = [];

    data.forEach((row, index) => {
      const email = row.email || row.Email || row.EMAIL;
      if (email && isValidEmail(email)) {
        emails.push({
          email_address: email.toLowerCase().trim(),
          user_id,
          source_type: 'EXCEL',
          created_at: new Date()
        });
      } else {
        errors.push(`Row ${index + 1}: Invalid email - ${email}`);
      }
    });

    // Bulk insert emails
    const createdEmails = await Email.bulkCreate(emails, {
      ignoreDuplicates: true,
      returning: true
    });

    // Add emails to group if groupId provided
    if (groupId && createdEmails.length > 0) {
      const groupMembers = createdEmails.map(email => ({
        email_group_id: groupId,
        email_id: email.id,
        created_at: new Date()
      }));

      await EmailGroupMember.bulkCreate(groupMembers, {
        ignoreDuplicates: true
      });

      // Update group email count
      await EmailGroup.increment('total_emails', {
        by: createdEmails.length,
        where: { id: groupId }
      });
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.status(HTTP_STATUS_CODE.OK).json({
      message: 'Emails imported successfully',
      imported_count: createdEmails.length,
      errors: errors.slice(0, 10), // Limit errors to first 10
      total_processed: emails.length
    });
  } catch (error) {
    console.error('Error importing emails from Excel:', error);
    res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      message: 'Error importing emails from Excel',
    });
  }
};

// Import emails from TownTicks followers
const importFromTownTicksFollowers = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { groupId } = req.body;

    // This would integrate with the parent database to get followers
    // For now, we'll simulate this with a placeholder
    // In a real implementation, you would query the parent database for User_Following records
    // where following_id = user_id (the business user)

    // Placeholder for TownTicks followers import
    // This would need to be implemented based on your parent database structure
    const followers = []; // This would come from parent DB query

    if (followers.length === 0) {
      return res.status(HTTP_STATUS_CODE.OK).json({
        message: 'No followers found to import',
        imported_count: 0
      });
    }

    const emails = followers.map(follower => ({
      email_address: follower.email,
      user_id,
      source_type: 'TOWNTICKS',
      created_at: new Date()
    }));

    // Bulk insert emails
    const createdEmails = await Email.bulkCreate(emails, {
      ignoreDuplicates: true,
      returning: true
    });

    // Add emails to group if groupId provided
    if (groupId && createdEmails.length > 0) {
      const groupMembers = createdEmails.map(email => ({
        email_group_id: groupId,
        email_id: email.id,
        created_at: new Date()
      }));

      await EmailGroupMember.bulkCreate(groupMembers, {
        ignoreDuplicates: true
      });

      // Update group email count
      await EmailGroup.increment('total_emails', {
        by: createdEmails.length,
        where: { id: groupId }
      });
    }

    res.status(HTTP_STATUS_CODE.OK).json({
      message: 'Followers imported successfully',
      imported_count: createdEmails.length
    });
  } catch (error) {
    console.error('Error importing followers:', error);
    res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      message: 'Error importing followers',
    });
  }
};

// Get all emails for a user
const getAllEmails = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { source_type, status, page = 1, limit = 50 } = req.query;

    let where = { user_id };
    if (source_type) where.source_type = source_type;
    if (status) where.status = status;

    const offset = (page - 1) * limit;

    const emails = await Email.findAndCountAll({
      where,
      include: [{
        model: EmailGroup,
        as: 'groups',
        through: { attributes: [] },
        attributes: ['id', 'name']
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(HTTP_STATUS_CODE.OK).json({
      message: 'Emails retrieved successfully',
      emails: emails.rows,
      pagination: {
        total: emails.count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(emails.count / limit)
      }
    });
  } catch (error) {
    console.error('Error retrieving emails:', error);
    res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      message: 'Error retrieving emails',
    });
  }
};

// Update email status
const updateEmailStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user_id = req.user.id;

    const email = await Email.findOne({ where: { id, user_id } });
    if (!email) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({ 
        message: 'Email not found' 
      });
    }

    await email.update({ 
      status,
      updated_at: new Date()
    });

    res.status(HTTP_STATUS_CODE.OK).json({ 
      message: 'Email status updated successfully',
      email 
    });
  } catch (error) {
    console.error('Error updating email status:', error);
    res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({ 
      message: 'Error updating email status' 
    });
  }
};

// Delete email
const deleteEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const email = await Email.findOne({ where: { id, user_id } });
    if (!email) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({ 
        message: 'Email not found' 
      });
    }

    // Remove from all groups first
    await EmailGroupMember.destroy({ where: { email_id: id } });

    // Update group email counts
    const groups = await EmailGroupMember.findAll({
      where: { email_id: id },
      attributes: ['email_group_id']
    });

    for (const group of groups) {
      await EmailGroup.decrement('total_emails', {
        where: { id: group.email_group_id }
      });
    }

    // Delete the email
    await email.destroy();

    res.status(HTTP_STATUS_CODE.OK).json({ 
      message: 'Email deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting email:', error);
    res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({ 
      message: 'Error deleting email' 
    });
  }
};

// Get email statistics
const getEmailStats = async (req, res) => {
  try {
    const user_id = req.user.id;

    const stats = await Email.findAll({
      where: { user_id },
      attributes: [
        'source_type',
        'status',
        [Email.sequelize.fn('COUNT', Email.sequelize.col('id')), 'count']
      ],
      group: ['source_type', 'status'],
      raw: true
    });

    const totalEmails = await Email.count({ where: { user_id } });
    const activeEmails = await Email.count({ 
      where: { user_id, status: 'ACTIVE' } 
    });
    const unsubscribedEmails = await Email.count({ 
      where: { user_id, status: 'UNSUBSCRIBED' } 
    });

    res.status(HTTP_STATUS_CODE.OK).json({
      message: 'Email statistics retrieved successfully',
      stats: {
        total_emails: totalEmails,
        active_emails: activeEmails,
        unsubscribed_emails: unsubscribedEmails,
        breakdown: stats
      }
    });
  } catch (error) {
    console.error('Error retrieving email statistics:', error);
    res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      message: 'Error retrieving email statistics'
    });
  }
};

// Helper function to validate email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

module.exports = {
  addEmail,
  importEmailsFromCSV,
  importEmailsFromExcel,
  importFromTownTicksFollowers,
  getAllEmails,
  updateEmailStatus,
  deleteEmail,
  getEmailStats
};
