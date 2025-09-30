const { body } = require('express-validator');

const emailGroupValidations = [
  body('name')
    .notEmpty().withMessage('Group name is required')
    .isString().withMessage('Group name must be a string')
    .isLength({ min: 1, max: 255 }).withMessage('Group name must be between 1 and 255 characters'),
  body('description')
    .optional()
    .isString().withMessage('Description must be a string')
    .isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),
  body('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE']).withMessage('Status must be ACTIVE or INACTIVE')
];

const updateEmailGroupValidations = [
  body('name')
    .optional()
    .isString().withMessage('Group name must be a string')
    .isLength({ min: 1, max: 255 }).withMessage('Group name must be between 1 and 255 characters'),
  body('description')
    .optional()
    .isString().withMessage('Description must be a string')
    .isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),
  body('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE']).withMessage('Status must be ACTIVE or INACTIVE')
];

module.exports = {
  emailGroupValidations,
  updateEmailGroupValidations
};
