const ticketRoutes = require('./ticketRoutes');
const paymentRoutes = require('./paymentRoutes');
const express = require('express');
const router = express.Router();

// test routes to check if server is working
router.get('/test', (req, res) => {
  res.status(200).json({ message: 'API is working!' });
});

// Mount routes
router.use('/ticket', ticketRoutes);
router.use('/payments', paymentRoutes);

module.exports = router;
