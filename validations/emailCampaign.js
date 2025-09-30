const { body } = require('express-validator');

const campaignValidations = [
  body('subject')
    .notEmpty().withMessage('Subject is required')
    .isString().withMessage('Subject must be a string')
    .isLength({ min: 1, max: 255 }).withMessage('Subject must be between 1 and 255 characters'),
  body('content')
    .notEmpty().withMessage('Content is required')
    .isString().withMessage('Content must be a string')
    .isLength({ min: 1 }).withMessage('Content cannot be empty'),
  body('email_group_id')
    .notEmpty().withMessage('Email group ID is required')
    .isInt({ min: 1 }).withMessage('Email group ID must be a positive integer'),
  body('scheduled_at')
    .optional()
    .isISO8601().withMessage('Scheduled date must be a valid date')
    .custom((value) => {
      if (value && new Date(value) <= new Date()) {
        throw new Error('Scheduled date must be in the future');
      }
      return true;
    })
];

const updateCampaignValidations = [
  body('subject')
    .optional()
    .isString().withMessage('Subject must be a string')
    .isLength({ min: 1, max: 255 }).withMessage('Subject must be between 1 and 255 characters'),
  body('content')
    .optional()
    .isString().withMessage('Content must be a string')
    .isLength({ min: 1 }).withMessage('Content cannot be empty'),
  body('scheduled_at')
    .optional()
    .isISO8601().withMessage('Scheduled date must be a valid date')
    .custom((value) => {
      if (value && new Date(value) <= new Date()) {
        throw new Error('Scheduled date must be in the future');
      }
      return true;
    }),
  body('status')
    .optional()
    .isIn(['DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'FAILED']).withMessage('Invalid status')
];

module.exports = {
  campaignValidations,
  updateCampaignValidations
};
