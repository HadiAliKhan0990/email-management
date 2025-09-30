const express = require('express');
const router = express.Router();

const {
  createEmailGroup,
  getAllEmailGroups,
  getEmailGroup,
  updateEmailGroup,
  deleteEmailGroup,
  addEmailToGroup,
  removeEmailFromGroup,
  getGroupStats
} = require('../controllers/emailGroupController');

const { emailGroupValidations, updateEmailGroupValidations } = require('../validations/emailGroup');
const { verifyToken } = require('../middlewares/authMiddleware');

// Create email group
router.post('/', verifyToken, emailGroupValidations, createEmailGroup);

// Get all email groups for user
router.get('/', verifyToken, getAllEmailGroups);

// Get single email group
router.get('/:id', verifyToken, getEmailGroup);

// Update email group
router.put('/:id', verifyToken, updateEmailGroupValidations, updateEmailGroup);

// Delete email group
router.delete('/:id', verifyToken, deleteEmailGroup);

// Add email to group
router.post('/:groupId/emails/:emailId', verifyToken, addEmailToGroup);

// Remove email from group
router.delete('/:groupId/emails/:emailId', verifyToken, removeEmailFromGroup);

// Get group statistics
router.get('/stats/overview', verifyToken, getGroupStats);

module.exports = router;
