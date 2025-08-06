const express = require('express');
const router = express.Router();

const {
  createPaymentIntent,
  confirmPayment,
  getPaymentStatus
} = require('../controllers/paymentController');

const { 
  createPaymentIntentValidations, 
  confirmPaymentValidations 
} = require('../validations/payment');

const { verifyToken } = require('../middlewares/authMiddleware');

// Create payment intent
router.post('/create-payment-intent', verifyToken, createPaymentIntentValidations, createPaymentIntent);

// Confirm payment completion
router.post('/confirm-payment', verifyToken, confirmPaymentValidations, confirmPayment);

// Get payment status
router.get('/status/:payment_intent_id', verifyToken, getPaymentStatus);