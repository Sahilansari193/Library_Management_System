const Fine = require('../models/Fine');
const BorrowRecord = require('../models/BorrowRecord');
const Membership = require('../models/Membership');
const Setting = require('../models/Setting');
const Notification = require('../models/Notification');
const { calculateFineAmount, getFineRate } = require('../services/fineCalculator');

// @desc    Get all fines (Admin)
// @route   GET /api/fines
// @access  Private/Admin
exports.getFines = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    let fines = await Fine.find(query)
      .populate('member', 'memberId fullName email phone')
      .populate('book', 'title author isbn coverImage')
      .populate('borrowRecord', 'transactionId issueDate dueDate returnDate')
      .populate('waivedBy', 'name email')
      .sort({ createdAt: -1 });

    if (search && search.trim() !== '') {
      const term = search.toLowerCase().trim();
      fines = fines.filter(
        (f) =>
          f.member?.fullName?.toLowerCase().includes(term) ||
          f.member?.memberId?.toLowerCase().includes(term) ||
          f.book?.title?.toLowerCase().includes(term) ||
          f.borrowRecord?.transactionId?.toLowerCase().includes(term)
      );
    }

    const total = fines.length;
    const paginatedFines = fines.slice(skip, skip + limitNum);

    res.status(200).json({
      success: true,
      count: paginatedFines.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      fines: paginatedFines,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in student fines
// @route   GET /api/fines/my-fines
// @access  Private/Student
exports.getMyFines = async (req, res, next) => {
  try {
    const membership = await Membership.findOne({ user: req.user._id });
    if (!membership) {
      return res.status(200).json({
        success: true,
        fines: [],
        totalPendingAmount: 0,
        totalPaidAmount: 0,
      });
    }

    const fines = await Fine.find({ member: membership._id })
      .populate('book', 'title author isbn coverImage')
      .populate('borrowRecord', 'transactionId issueDate dueDate returnDate')
      .sort({ createdAt: -1 });

    const totalPendingAmount = fines
      .filter((f) => f.status === 'Pending' || f.status === 'Partially Paid')
      .reduce((sum, f) => sum + (f.balanceAmount || 0), 0);

    const totalPaidAmount = fines.reduce((sum, f) => sum + (f.amountPaid || 0), 0);

    res.status(200).json({
      success: true,
      count: fines.length,
      fines,
      totalPendingAmount,
      totalPaidAmount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Calculate / Preview fine for a borrow record
// @route   POST /api/fines/calculate
// @access  Private
exports.calculateFinePreview = async (req, res, next) => {
  try {
    const { borrowRecordId, returnDate } = req.body;

    const record = await BorrowRecord.findById(borrowRecordId);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Borrow record not found' });
    }

    const fineDetails = await calculateFineAmount(record.dueDate, returnDate || new Date());

    res.status(200).json({
      success: true,
      calculation: {
        dueDate: record.dueDate,
        returnDate: returnDate || new Date(),
        ...fineDetails,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Waive a fine with reason
// @route   PUT /api/fines/:id/waive
// @access  Private/Admin
exports.waiveFine = async (req, res, next) => {
  try {
    const { reason } = req.body;

    if (!reason || reason.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'A valid reason is required to waive a library fine',
      });
    }

    const fine = await Fine.findById(req.params.id)
      .populate('member')
      .populate('book');

    if (!fine) {
      return res.status(404).json({ success: false, message: 'Fine record not found' });
    }

    if (fine.status === 'Waived') {
      return res.status(400).json({ success: false, message: 'This fine has already been waived' });
    }

    if (fine.status === 'Paid') {
      return res.status(400).json({ success: false, message: 'Cannot waive a fine that is already paid' });
    }

    fine.status = 'Waived';
    fine.waivedReason = reason.trim();
    fine.waivedAt = new Date();
    fine.waivedBy = req.user._id;
    fine.balanceAmount = 0;

    await fine.save();

    // Notify student
    if (fine.member?.user) {
      await Notification.create({
        user: fine.member.user,
        member: fine.member._id,
        title: 'Library Fine Waived',
        message: `Your fine of ₹${fine.totalAmount} for "${fine.book?.title || 'Book'}" has been waived by admin. Reason: ${reason}`,
        type: 'General',
      });
    }

    res.status(200).json({
      success: true,
      fine,
      message: `Fine of ₹${fine.totalAmount} successfully waived.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current fine rate setting
// @route   GET /api/fines/rate
// @access  Private
exports.getFineRateSetting = async (req, res, next) => {
  try {
    const rate = await getFineRate();
    res.status(200).json({
      success: true,
      finePerDay: rate,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update system fine rate setting
// @route   PUT /api/fines/rate
// @access  Private/Admin
exports.updateFineRateSetting = async (req, res, next) => {
  try {
    const { finePerDay } = req.body;
    const num = Number(finePerDay);

    if (isNaN(num) || num < 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid non-negative number for fine rate per day',
      });
    }

    await Setting.findOneAndUpdate(
      { key: 'DEFAULT_FINE_PER_DAY' },
      { key: 'DEFAULT_FINE_PER_DAY', value: num, description: 'Fine charged per overdue day in INR' },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      finePerDay: num,
      message: `Default fine rate updated to ₹${num} per day.`,
    });
  } catch (error) {
    next(error);
  }
};
