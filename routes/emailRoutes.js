const express = require('express');
const router = express.Router();
const multer = require('multer');

const {
  addEmail,
  importEmailsFromCSV,
  importEmailsFromExcel,
  importFromTownTicksFollowers,
  getAllEmails,
  updateEmailStatus,
  deleteEmail,
  getEmailStats
} = require('../controllers/emailController');

const { emailValidations, updateEmailStatusValidations, importEmailsValidations } = require('../validations/email');
const { verifyToken } = require('../middlewares/authMiddleware');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel' || file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and Excel files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Add single email manually
router.post('/', verifyToken, emailValidations, addEmail);

// Import emails from CSV
router.post('/import/csv', verifyToken, upload.single('file'), importEmailsValidations, importEmailsFromCSV);

// Import emails from Excel
router.post('/import/excel', verifyToken, upload.single('file'), importEmailsValidations, importEmailsFromExcel);

// Import emails from TownTicks followers
router.post('/import/townticks', verifyToken, importEmailsValidations, importFromTownTicksFollowers);

// Get all emails for user
router.get('/', verifyToken, getAllEmails);

// Update email status
router.put('/:id/status', verifyToken, updateEmailStatusValidations, updateEmailStatus);

// Delete email
router.delete('/:id', verifyToken, deleteEmail);

// Get email statistics
router.get('/stats/overview', verifyToken, getEmailStats);

module.exports = router;
