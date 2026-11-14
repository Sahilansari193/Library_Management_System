const express = require('express');
const router = express.Router();
const {
  getFines,
  getMyFines,
  calculateFinePreview,
  waiveFine,
  getFineRateSetting,
  updateFineRateSetting,
} = require('../controllers/fineController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/my-fines', getMyFines);
router.post('/calculate', calculateFinePreview);
router.get('/rate', getFineRateSetting);

// Admin only
router.get('/', authorize('admin'), getFines);
router.put('/:id/waive', authorize('admin'), waiveFine);
router.put('/rate', authorize('admin'), updateFineRateSetting);

module.exports = router;
