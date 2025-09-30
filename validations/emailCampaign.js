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
    .optional()
    .isInt({ min: 1 }).withMessage('Email group ID must be a positive integer'),
  body('recipient_email_address')
    .optional()
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('recipient_email_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Recipient email ID must be a positive integer'),
  body('scheduled_at')
    .optional()
    .isISO8601().withMessage('Scheduled date must be a valid date')
    .custom((value) => {
      if (value && new Date(value) <= new Date()) {
        throw new Error('Scheduled date must be in the future');
      }
      return true;
    }),
  // Cross-field validation: must provide either group or single recipient
  body().custom((value, { req }) => {
    const { email_group_id, recipient_email_address, recipient_email_id } = req.body;

    const hasSingleRecipient = recipient_email_address || recipient_email_id;

    if (!hasSingleRecipient && !email_group_id) {
      throw new Error('Either email_group_id (for group send) or recipient_email_address/recipient_email_id (for single send) is required');
    }
    if (hasSingleRecipient && email_group_id) {
      throw new Error('Provide either email_group_id or a single recipient (recipient_email_address/recipient_email_id), not both');
    }
    if (recipient_email_address && recipient_email_id) {
      throw new Error('Provide either recipient_email_address or recipient_email_id, not both');
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
