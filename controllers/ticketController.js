const Ticket = require('../models/ticket');
const { validationResult } = require('express-validator');
const { HTTP_STATUS_CODE } = require('../utils/httpStatus');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { generateTicketQRCode } = require('../utils/qrCodeGenerator');

const createTicket = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ errors: errors.array() });
  }
  try {
    const {
      name,
      companyName,
      ticketType,
      totalAvailable,
      ticketValue,
      expiryDate,
    } = req.body;

    const newTicket = await Ticket.create({
      name,
      companyName,
      ticketType,
      totalAvailable,
      ticketValue,
      expiryDate,
    });

    const qrCode = await generateTicketQRCode(newTicket);

    res.status(HTTP_STATUS_CODE.CREATED).json({
      message: 'Ticket created successfully',
      ticket: {
        ...newTicket.toJSON(),
        qrCode
      }
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      message: 'Error creating ticket',
    });
  }
};

const getAllTickets = async (req, res) => {
  try {
    const onlyAvailable = req.query.available === 'true';
    let where = {};
    if (onlyAvailable) {
      where = {
        totalAvailable: { [Op.gt]: 0 },
        expiryDate: { [Op.gt]: new Date() },
      };
    }
    const tickets = await Ticket.findAll({ where });
    const ticketsWithQR = await Promise.all(
      tickets.map(async (ticket) => {
        const qrCode = await generateTicketQRCode(ticket);
        return {
          ...ticket.toJSON(),
          qrCode
        };
      })
    );
    res.status(HTTP_STATUS_CODE.OK).json({
      message: 'Tickets retrieved successfully',
      tickets: ticketsWithQR,
    });
  } catch (error) {
    console.error('Error retrieving tickets:', error);
    res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      message: 'Error retrieving tickets',
    });
  }
};

const getTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({ message: 'Ticket not found' });
    }
    const qrCode = await generateTicketQRCode(ticket);
    res.status(HTTP_STATUS_CODE.OK).json({ 
      ticket: {
        ...ticket.toJSON(),
        qrCode
      }
    });
  } catch (error) {
    console.error('Error retrieving ticket:', error);
    res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({ message: 'Error retrieving ticket' });
  }
};

const updateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({ message: 'Ticket not found' });
    }
    await ticket.update(req.body);
    res.status(HTTP_STATUS_CODE.OK).json({ message: 'Ticket updated', ticket });
  } catch (error) {
    res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({ message: 'Error updating ticket' });
  }
};

const deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({ message: 'Ticket not found' });
    }
    await ticket.destroy();
    res.status(HTTP_STATUS_CODE.OK).json({ message: 'Ticket deleted' });
  } catch (error) {
    res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({ message: 'Error deleting ticket' });
  }
};

// BUY ticket (decrement totalAvailable)
const buyTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({ message: 'Ticket not found' });
    }
    if (ticket.totalAvailable <= 0) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ message: 'No more tickets available to buy' });
    }
    ticket.totalAvailable -= 1;
    await ticket.save();
    const qrCode = await generateTicketQRCode(ticket);
    res.status(HTTP_STATUS_CODE.OK).json({
      message: 'Ticket bought successfully',
      ticket: {
        ...ticket.toJSON(),
        qrCode
      }
    });
  } catch (error) {
    console.error('Error buying ticket:', error);
    res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({ message: 'Error buying ticket' });
  }
};

const getBusinessStats = async (req, res) => {
  try {
    const { companyName } = req.params;
    // Get all tickets for this company
    const tickets = await Ticket.findAll({
      where: { companyName },
      attributes: ['ticketType', 'totalTickets', 'totalAvailable'],
      raw: true
    });
    // Group by ticketType
    const statsMap = {};
    tickets.forEach(ticket => {
      if (!statsMap[ticket.ticketType]) {
        statsMap[ticket.ticketType] = { created: 0, used: 0 };
      }
      statsMap[ticket.ticketType].created += ticket.totalTickets;
      statsMap[ticket.ticketType].used += (ticket.totalTickets - ticket.totalAvailable);
    });
    const result = Object.entries(statsMap).map(([ticketType, { created, used }]) => ({
      ticketType,
      created,
      used
    }));
    res.status(HTTP_STATUS_CODE.OK).json({
      message: 'Business statistics retrieved successfully',
      stats: result
    });
  } catch (error) {
    console.error('Error retrieving business statistics:', error);
    res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      message: 'Error retrieving business statistics'
    });
  }
};

module.exports = {
  createTicket,
  getAllTickets,
  getTicket,
  updateTicket,
  deleteTicket,
  buyTicket,
  getBusinessStats
};
