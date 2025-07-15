const ticketRoutes = require('./ticketRoutes');
const express = require('express');
const router = express.Router();

// test routes to check if server is working
router.get('/test', (req, res) => {
  res.status(200).json({ message: 'API is working!' });
});

router.use('api/ticket', ticketRoutes);

module.exports = router;
