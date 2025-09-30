const { body } = require('express-validator');

const emailValidations = [
  body('email_address')
    .notEmpty().withMessage('Email address is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail()
    .isLength({ max: 255 }).withMessage('Email address must not exceed 255 characters')
];

const updateEmailStatusValidations = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['ACTIVE', 'INACTIVE', 'UNSUBSCRIBED']).withMessage('Status must be ACTIVE, INACTIVE, or UNSUBSCRIBED')
];

const importEmailsValidations = [
  body('groupId')
    .optional()
    .isInt({ min: 1 }).withMessage('Group ID must be a positive integer')
];

module.exports = {
  emailValidations,
  updateEmailStatusValidations,
  importEmailsValidations
};
