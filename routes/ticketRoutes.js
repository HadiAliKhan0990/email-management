const express = require('express');
const router = express.Router();

const {
  createTicket,
  getAllTickets,
  getTicket,
  updateTicket,
  deleteTicket,
  buyTicket,
  getBusinessStats
} = require('../controllers/ticketController');

const { ticketValidations } = require('../validations/ticket');
const { verifyToken, requireAdmin } = require('../middlewares/authMiddleware');

// Create ticket (admin only)
router.post('/', verifyToken, requireAdmin, ticketValidations, createTicket);
// Get all tickets
router.get('/', verifyToken, getAllTickets);
// Get single ticket
router.get('/:id', verifyToken, getTicket);
// Update ticket (admin only)
router.put('/:id', verifyToken, requireAdmin, ticketValidations, updateTicket);
// Delete ticket (admin only)
router.delete('/:id', verifyToken, requireAdmin, deleteTicket);
// Buy ticket
router.post('/:id/buy', verifyToken, buyTicket);
// Get business statistics
router.get('/business/:companyName/stats', verifyToken, getBusinessStats);

module.exports = router;
