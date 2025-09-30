const { EmailGroup, Email, EmailGroupMember } = require('../models');
const { validationResult } = require('express-validator');
const { HTTP_STATUS_CODE } = require('../utils/httpStatus');
const { Op } = require('sequelize');

// Create email group
const createEmailGroup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ errors: errors.array() });
  }

  try {
    const { name, description } = req.body;
    const user_id = req.user.id; // From JWT token

    const newGroup = await EmailGroup.create({
      name,
      description,
      user_id,
      created_at: new Date(),
    });

    res.status(HTTP_STATUS_CODE.CREATED).json({
      message: 'Email group created successfully',
      group: newGroup
    });
  } catch (error) {
    console.error('Error creating email group:', error);
    res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      message: 'Error creating email group',
    });
  }
};

// Get all email groups for a user
const getAllEmailGroups = async (req, res) => {
  try {
    const user_id = req.user.id;
    const groups = await EmailGroup.findAll({
      where: { user_id },
      include: [{
        model: Email,
        as: 'emails',
        through: { attributes: [] },
        attributes: ['id', 'email_address', 'source_type', 'status']
      }],
      order: [['created_at', 'DESC']]
    });

    res.status(HTTP_STATUS_CODE.OK).json({
      message: 'Email groups retrieved successfully',
      groups
    });
  } catch (error) {
    console.error('Error retrieving email groups:', error);
    res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      message: 'Error retrieving email groups',
    });
  }
};

// Get single email group
const getEmailGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const group = await EmailGroup.findOne({
      where: { id, user_id },
      include: [{
        model: Email,
        as: 'emails',
        through: { attributes: [] },
        attributes: ['id', 'email_address', 'source_type', 'status', 'created_at']
      }]
    });

    if (!group) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({ 
        message: 'Email group not found' 
      });
    }

    res.status(HTTP_STATUS_CODE.OK).json({
      message: 'Email group retrieved successfully',
      group
    });
  } catch (error) {
    console.error('Error retrieving email group:', error);
    res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({ 
      message: 'Error retrieving email group' 
    });
  }
};

// Update email group
const updateEmailGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    const { name, description, status } = req.body;

    const group = await EmailGroup.findOne({ where: { id, user_id } });
    if (!group) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({ 
        message: 'Email group not found' 
      });
    }

    await group.update({
      name: name || group.name,
      description: description !== undefined ? description : group.description,
      status: status || group.status,
      updated_at: new Date()
    });

    res.status(HTTP_STATUS_CODE.OK).json({ 
      message: 'Email group updated successfully',
      group 
    });
  } catch (error) {
    console.error('Error updating email group:', error);
    res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({ 
      message: 'Error updating email group' 
    });
  }
};

// Delete email group
const deleteEmailGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const group = await EmailGroup.findOne({ where: { id, user_id } });
    if (!group) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({ 
        message: 'Email group not found' 
      });
    }

    // Remove all group members first
    await EmailGroupMember.destroy({ where: { email_group_id: id } });
    
    // Delete the group
    await group.destroy();

    res.status(HTTP_STATUS_CODE.OK).json({ 
      message: 'Email group deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting email group:', error);
    res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({ 
      message: 'Error deleting email group' 
    });
  }
};

// Add email to group
const addEmailToGroup = async (req, res) => {
  try {
    const { groupId, emailId } = req.params;
    const user_id = req.user.id;

    // Verify group belongs to user
    const group = await EmailGroup.findOne({ where: { id: groupId, user_id } });
    if (!group) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({ 
        message: 'Email group not found' 
      });
    }


    // Check if email is already in group
    const existingMember = await EmailGroupMember.findOne({
      where: { email_group_id: groupId, email_id: emailId }
    });

    if (existingMember) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ 
        message: 'Email is already in this group' 
      });
    }

    // Add email to group
    await EmailGroupMember.create({
      email_group_id: groupId,
      email_id: emailId,
      created_at: new Date()
    });

    // Update group email count
    await group.increment('total_emails');

    res.status(HTTP_STATUS_CODE.OK).json({ 
      message: 'Email added to group successfully' 
    });
  } catch (error) {
    console.error('Error adding email to group:', error);
    res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({ 
      message: 'Error adding email to group' 
    });
  }
};

// Remove email from group
const removeEmailFromGroup = async (req, res) => {
  try {
    const { groupId, emailId } = req.params;
    const user_id = req.user.id;

    // Verify group belongs to user
    const group = await EmailGroup.findOne({ where: { id: groupId, user_id } });
    if (!group) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({ 
        message: 'Email group not found' 
      });
    }

    // Remove email from group
    const result = await EmailGroupMember.destroy({
      where: { email_group_id: groupId, email_id: emailId }
    });

    if (result === 0) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({ 
        message: 'Email not found in this group' 
      });
    }

    // Update group email count
    await group.decrement('total_emails');

    res.status(HTTP_STATUS_CODE.OK).json({ 
      message: 'Email removed from group successfully' 
    });
  } catch (error) {
    console.error('Error removing email from group:', error);
    res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({ 
      message: 'Error removing email from group' 
    });
  }
};

// Get group statistics
const getGroupStats = async (req, res) => {
  try {
    const user_id = req.user.id;

    const stats = await EmailGroup.findAll({
      where: { user_id },
      attributes: [
        'id',
        'name',
        'total_emails',
        'status',
        'created_at'
      ],
      order: [['total_emails', 'DESC']]
    });

    const totalGroups = stats.length;
    const totalEmails = stats.reduce((sum, group) => sum + group.total_emails, 0);
    const activeGroups = stats.filter(group => group.status === 'ACTIVE').length;

    res.status(HTTP_STATUS_CODE.OK).json({
      message: 'Group statistics retrieved successfully',
      stats: {
        total_groups: totalGroups,
        total_emails: totalEmails,
        active_groups: activeGroups,
        groups: stats
      }
    });
  } catch (error) {
    console.error('Error retrieving group statistics:', error);
    res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      message: 'Error retrieving group statistics'
    });
  }
};

module.exports = {
  createEmailGroup,
  getAllEmailGroups,
  getEmailGroup,
  updateEmailGroup,
  deleteEmailGroup,
  addEmailToGroup,
  removeEmailFromGroup,
  getGroupStats
};
