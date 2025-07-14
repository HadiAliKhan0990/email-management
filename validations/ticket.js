const { body } = require('express-validator');

const ticketValidations = [
  body('name')
    .notEmpty().withMessage('Ticket name is required')
    .isString().withMessage('Ticket name must be a string'),
  body('companyName')
    .notEmpty().withMessage('Company name is required')
    .isString().withMessage('Company name must be a string'),
  body('ticketType')
    .notEmpty().withMessage('Ticket type is required')
    .isString().withMessage('Ticket type must be a string'),
  body('totalTickets')
    .notEmpty().withMessage('Total tickets is required')
    .isInt({ min: 1 }).withMessage('Total tickets must be at least 1'),
  body('totalAvailable')
    .notEmpty().withMessage('Total available is required')
    .isInt({ min: 0 }).withMessage('Total available must be 0 or more'),
  body('ticketValue')
    .notEmpty().withMessage('Ticket value is required')
    .isInt({ min: 0 }).withMessage('Ticket value must be 0 or more'),
  body('expiryDate')
    .notEmpty().withMessage('Expiry date is required')
    .isISO8601().withMessage('Expiry date must be a valid date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Expiry date must be in the future');
      }
      return true;
    }),
];

module.exports = {
  ticketValidations,
}; 