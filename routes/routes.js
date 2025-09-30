const emailGroupRoutes = require('./emailGroupRoutes');
const emailRoutes = require('./emailRoutes');
const emailCampaignRoutes = require('./emailCampaignRoutes');
const express = require('express');
const 
  router = express.Router();

// test routes to check if server is working
router.get('/test', (req, res) => {
  res.status(200).json({ message: 'Email Service API is working!' });
});

// Mount routes
router.use('/email-groups', emailGroupRoutes);
router.use('/emails', emailRoutes);
router.use('/campaigns', emailCampaignRoutes);

module.exports = router;
