const express = require('express');
const router = express.Router();
const {
  getAllPayments,
  getMyPayments,
  processPayment,
  getPaymentReceipt,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/my-payments', getMyPayments);
router.post('/pay', processPayment);
router.get('/receipt/:id', getPaymentReceipt);

// Admin only
router.get('/', authorize('admin'), getAllPayments);

module.exports = router;
