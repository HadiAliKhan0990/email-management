const express = require('express');
const router = express.Router();

const {
  createCampaign,
  getAllCampaigns,
  getCampaign,
  updateCampaign,
  sendCampaign,
  deleteCampaign,
  getCampaignAnalytics
} = require('../controllers/emailCampaignController');

const { campaignValidations, updateCampaignValidations } = require('../validations/emailCampaign');
const { verifyToken } = require('../middlewares/authMiddleware');

// Create email campaign
router.post('/', verifyToken, campaignValidations, createCampaign);

// Get all campaigns for user
router.get('/', verifyToken, getAllCampaigns);

// Get single campaign
router.get('/:id', verifyToken, getCampaign);

// Update campaign
router.put('/:id', verifyToken, updateCampaignValidations, updateCampaign);

// Send campaign
router.post('/:id/send', verifyToken, sendCampaign);

// Delete campaign
router.delete('/:id', verifyToken, deleteCampaign);

// Get campaign analytics
router.get('/:id/analytics', verifyToken, getCampaignAnalytics);

module.exports = router;
