const express = require('express');
const router = express.Router();
const {
  getBorrowRecords,
  getMyBorrowRecords,
  issueBook,
  returnBook,
} = require('../controllers/borrowController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/my-books', getMyBorrowRecords);
router.get('/', authorize('admin'), getBorrowRecords);
router.post('/issue', authorize('admin'), issueBook);
router.put('/return/:id', authorize('admin'), returnBook);

module.exports = router;
