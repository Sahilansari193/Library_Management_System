const Payment = require('../models/Payment');
const Fine = require('../models/Fine');
const Membership = require('../models/Membership');
const Notification = require('../models/Notification');

// @desc    Get all payments (Admin)
// @route   GET /api/payments
// @access  Private/Admin
exports.getAllPayments = async (req, res, next) => {
  try {
    const { search, method, page = 1, limit = 10 } = req.query;
    const query = {};

    if (method && method !== 'All') {
      query.paymentMethod = method;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    let payments = await Payment.find(query)
      .populate('member', 'memberId fullName email phone')
      .populate({
        path: 'fine',
        populate: [
          { path: 'book', select: 'title author isbn' },
          { path: 'borrowRecord', select: 'transactionId issueDate dueDate returnDate' },
        ],
      })
      .sort({ createdAt: -1 });

    if (search && search.trim() !== '') {
      const term = search.toLowerCase().trim();
      payments = payments.filter(
        (p) =>
          p.receiptNumber?.toLowerCase().includes(term) ||
          p.transactionReference?.toLowerCase().includes(term) ||
          p.member?.fullName?.toLowerCase().includes(term) ||
          p.member?.memberId?.toLowerCase().includes(term)
      );
    }

    const total = payments.length;
    const paginatedPayments = payments.slice(skip, skip + limitNum);

    res.status(200).json({
      success: true,
      count: paginatedPayments.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      payments: paginatedPayments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in student payment history
// @route   GET /api/payments/my-payments
// @access  Private/Student
exports.getMyPayments = async (req, res, next) => {
  try {
    const membership = await Membership.findOne({ user: req.user._id });
    if (!membership) {
      return res.status(200).json({
        success: true,
        payments: [],
      });
    }

    const payments = await Payment.find({ member: membership._id })
      .populate({
        path: 'fine',
        populate: [
          { path: 'book', select: 'title author isbn' },
          { path: 'borrowRecord', select: 'transactionId' },
        ],
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Process a simulated fine payment (UPI, Card, Cash)
// @route   POST /api/payments/pay
// @access  Private
exports.processPayment = async (req, res, next) => {
  try {
    const { fineId, amount, paymentMethod, transactionReference, notes } = req.body;

    if (!fineId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Please provide fine ID and payment amount',
      });
    }

    const fine = await Fine.findById(fineId).populate('book').populate('member');
    if (!fine) {
      return res.status(404).json({ success: false, message: 'Fine record not found' });
    }

    if (fine.status === 'Paid') {
      return res.status(400).json({ success: false, message: 'This fine is already fully paid' });
    }

    if (fine.status === 'Waived') {
      return res.status(400).json({ success: false, message: 'This fine was waived; no payment is required' });
    }

    const paymentAmount = Number(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Payment amount must be greater than 0' });
    }

    const currentBalance = fine.balanceAmount !== undefined ? fine.balanceAmount : fine.totalAmount - (fine.amountPaid || 0);

    if (paymentAmount > currentBalance) {
      return res.status(400).json({
        success: false,
        message: `Payment amount (₹${paymentAmount}) cannot exceed the remaining balance (₹${currentBalance})`,
      });
    }

    // Generate receipt number
    const count = await Payment.countDocuments();
    const receiptNumber = `RCP-${new Date().getFullYear()}-${String(count + 8001).padStart(5, '0')}`;
    const txnRef =
      transactionReference ||
      `SIM-${(paymentMethod || 'UPI').toUpperCase()}-${Date.now().toString().slice(-6)}`;

    // Create payment entry
    const payment = await Payment.create({
      receiptNumber,
      transactionReference: txnRef,
      fine: fine._id,
      member: fine.member._id,
      amount: paymentAmount,
      paymentMethod: paymentMethod || 'UPI',
      paymentStatus: 'Completed',
      notes: notes || 'Demo payment gateway transaction simulation',
    });

    // Update Fine document
    fine.amountPaid = (fine.amountPaid || 0) + paymentAmount;
    fine.balanceAmount = Math.max(0, currentBalance - paymentAmount);
    if (fine.balanceAmount === 0) {
      fine.status = 'Paid';
    } else {
      fine.status = 'Partially Paid';
    }
    await fine.save();

    // Create in-app notification for the student
    if (fine.member?.user) {
      await Notification.create({
        user: fine.member.user,
        member: fine.member._id,
        title: 'Payment Successful',
        message: `Your payment of ₹${paymentAmount} has been processed via ${paymentMethod || 'UPI'}. Receipt #${receiptNumber}`,
        type: 'Payment',
      });
    }

    const populatedPayment = await Payment.findById(payment._id)
      .populate('member', 'memberId fullName email phone address')
      .populate({
        path: 'fine',
        populate: [
          { path: 'book', select: 'title author isbn' },
          { path: 'borrowRecord', select: 'transactionId issueDate dueDate returnDate' },
        ],
      });

    res.status(201).json({
      success: true,
      payment: populatedPayment,
      fine,
      message: `Demo payment of ₹${paymentAmount} completed successfully. Receipt: ${receiptNumber}`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single payment receipt
// @route   GET /api/payments/receipt/:id
// @access  Private
exports.getPaymentReceipt = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('member', 'memberId fullName email phone address')
      .populate({
        path: 'fine',
        populate: [
          { path: 'book', select: 'title author isbn publisher' },
          { path: 'borrowRecord', select: 'transactionId issueDate dueDate returnDate' },
        ],
      });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    next(error);
  }
};
