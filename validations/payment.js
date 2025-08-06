const { body } = require('express-validator');

const createPaymentIntentValidations = [
  body('ticket_id')
    .notEmpty().withMessage('Ticket ID is required')
    .isInt({ min: 1 }).withMessage('Ticket ID must be a valid integer'),
  body('email')
    .optional()
    .isEmail().withMessage('Email must be a valid email address')
    .normalizeEmail(),
];

const confirmPaymentValidations = [
  body('payment_intent_id')
    .notEmpty().withMessage('Payment intent ID is required')
    .isString().withMessage('Payment intent ID must be a string'),
  body('ticket_id')
    .notEmpty().withMessage('Ticket ID is required')
    .isInt({ min: 1 }).withMessage('Ticket ID must be a valid integer'),
];

module.exports = {
  createPaymentIntentValidations,
  confirmPaymentValidations
}; 