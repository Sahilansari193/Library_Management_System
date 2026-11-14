const express = require('express');
const router = express.Router();
const { getAnalytics, exportReportCSV } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/analytics', getAnalytics);
router.get('/export/:type', exportReportCSV);

module.exports = router;
