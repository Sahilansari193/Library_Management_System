const express = require('express');
const router = express.Router();
const {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  renewMembership,
  deleteMember,
} = require('../controllers/memberController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', authorize('admin'), getMembers);
router.post('/', authorize('admin'), createMember);
router.get('/:id', getMemberById);
router.put('/:id', authorize('admin'), updateMember);
router.post('/:id/renew', authorize('admin'), renewMembership);
router.delete('/:id', authorize('admin'), deleteMember);

module.exports = router;
