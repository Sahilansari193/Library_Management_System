const express = require('express');
const router = express.Router();
const { getReminders, sendReminder } = require('../controllers/reminderController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/', getReminders);
router.post('/:id/send', sendReminder);

module.exports = router;
