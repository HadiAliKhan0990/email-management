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

// Create ticket
router.post('/', ticketValidations, createTicket);
// Get all tickets
router.get('/', getAllTickets);
// Get single ticket
router.get('/:id', getTicket);
// Update ticket
router.put('/:id', ticketValidations, updateTicket);
// Delete ticket
router.delete('/:id', deleteTicket);
// Buy ticket
router.post('/:id/buy', buyTicket);
// Get business statistics
router.get('/business/:companyName/stats', getBusinessStats);

module.exports = router;
