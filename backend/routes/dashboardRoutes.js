const express = require('express');
const router = express.Router();
const {
  getAdminDashboardStats,
  getStudentDashboardStats,
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/stats', authorize('admin'), getAdminDashboardStats);
router.get('/student-stats', getStudentDashboardStats);

module.exports = router;
