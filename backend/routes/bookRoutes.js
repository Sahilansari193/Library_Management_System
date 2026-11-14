const express = require('express');
const router = express.Router();
const {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getCategories,
} = require('../controllers/bookController');
const { protect, authorize } = require('../middleware/auth');

router.get('/categories', getCategories);
router.get('/', getBooks);
router.get('/:id', getBookById);

// Admin-only endpoints
router.post('/', protect, authorize('admin'), createBook);
router.put('/:id', protect, authorize('admin'), updateBook);
router.delete('/:id', protect, authorize('admin'), deleteBook);

module.exports = router;
