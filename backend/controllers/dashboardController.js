const Book = require('../models/Book');
const Membership = require('../models/Membership');
const BorrowRecord = require('../models/BorrowRecord');
const Fine = require('../models/Fine');
const Payment = require('../models/Payment');

// @desc    Get dynamic admin dashboard statistics and summaries
// @route   GET /api/dashboard/stats
// @access  Private/Admin
exports.getAdminDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();

    // 1. Auto-sync expired memberships
    await Membership.updateMany(
      { expiryDate: { $lt: now }, status: 'Active' },
      { $set: { status: 'Expired' } }
    );

    // 2. Auto-sync overdue borrows
    await BorrowRecord.updateMany(
      { status: 'Issued', dueDate: { $lt: now } },
      { $set: { status: 'Overdue' } }
    );

    // Parallel counts & aggregations for high performance
    const [
      totalBooksCount,
      totalRegisteredMembers,
      activeMemberships,
      expiredMemberships,
      currentlyBorrowedBooks,
      overdueBooks,
      pendingFinesAgg,
      collectedPaymentsAgg,
    ] = await Promise.all([
      Book.countDocuments(),
      Membership.countDocuments(),
      Membership.countDocuments({ status: 'Active' }),
      Membership.countDocuments({ status: 'Expired' }),
      BorrowRecord.countDocuments({ status: { $in: ['Issued', 'Overdue'] } }),
      BorrowRecord.countDocuments({ status: 'Overdue' }),
      Fine.aggregate([
        { $match: { status: { $in: ['Pending', 'Partially Paid'] } } },
        { $group: { _id: null, total: { $sum: '$balanceAmount' } } },
      ]),
      Payment.aggregate([
        { $match: { paymentStatus: 'Completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    const totalPendingFines = pendingFinesAgg.length > 0 ? pendingFinesAgg[0].total : 0;
    const totalCollectedPayments = collectedPaymentsAgg.length > 0 ? collectedPaymentsAgg[0].total : 0;

    // Recent items queries
    const [
      recentMembers,
      recentlyBorrowed,
      recentlyReturned,
      overdueAlerts,
    ] = await Promise.all([
      Membership.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('memberId fullName email plan status createdAt'),
      BorrowRecord.find({ status: { $in: ['Issued', 'Overdue'] } })
        .sort({ issueDate: -1 })
        .limit(5)
        .populate('book', 'title author coverImage')
        .populate('member', 'fullName memberId'),
      BorrowRecord.find({ status: 'Returned' })
        .sort({ returnDate: -1 })
        .limit(5)
        .populate('book', 'title author coverImage')
        .populate('member', 'fullName memberId'),
      BorrowRecord.find({ status: 'Overdue' })
        .sort({ dueDate: 1 })
        .limit(5)
        .populate('book', 'title author')
        .populate('member', 'fullName memberId phone email'),
    ]);

    // Monthly Fine Collection Summary for chart/graph (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyPayments = await Payment.aggregate([
      { $match: { paymentDate: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$paymentDate' },
            month: { $month: '$paymentDate' },
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalBooks: totalBooksCount,
        totalRegisteredMembers,
        activeMemberships,
        expiredMemberships,
        currentlyBorrowedBooks,
        overdueBooks,
        totalPendingFines,
        totalCollectedPayments,
      },
      recentMembers,
      recentlyBorrowed,
      recentlyReturned,
      overdueAlerts,
      monthlyPayments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dynamic student dashboard statistics
// @route   GET /api/dashboard/student-stats
// @access  Private/Student
exports.getStudentDashboardStats = async (req, res, next) => {
  try {
    const membership = await Membership.findOne({ user: req.user._id });

    if (!membership) {
      return res.status(200).json({
        success: true,
        stats: {
          membershipStatus: 'None',
          expiryDate: null,
          currentlyBorrowedBooks: 0,
          upcomingDueDatesCount: 0,
          overdueBooksCount: 0,
          pendingFineAmount: 0,
          totalFinePaid: 0,
        },
        borrowedBooks: [],
        fines: [],
        payments: [],
      });
    }

    // Refresh membership expiry
    membership.checkExpiry();
    await membership.save();

    const now = new Date();
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Active borrows
    const activeBorrows = await BorrowRecord.find({
      member: membership._id,
      status: { $in: ['Issued', 'Overdue'] },
    }).populate('book', 'title author coverImage isbn shelfLocation');

    const overdueCount = activeBorrows.filter((b) => new Date(b.dueDate) < now).length;
    const upcomingCount = activeBorrows.filter(
      (b) => new Date(b.dueDate) >= now && new Date(b.dueDate) <= threeDaysLater
    ).length;

    // Fines
    const fines = await Fine.find({ member: membership._id })
      .populate('book', 'title author')
      .populate('borrowRecord', 'transactionId dueDate');

    const pendingFineAmount = fines
      .filter((f) => f.status === 'Pending' || f.status === 'Partially Paid')
      .reduce((sum, f) => sum + (f.balanceAmount || 0), 0);

    const totalFinePaid = fines.reduce((sum, f) => sum + (f.amountPaid || 0), 0);

    // Recent Payments
    const payments = await Payment.find({ member: membership._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('fine');

    res.status(200).json({
      success: true,
      stats: {
        membershipStatus: membership.status,
        membershipPlan: membership.plan,
        membershipExpiryDate: membership.expiryDate,
        memberId: membership.memberId,
        currentlyBorrowedBooks: activeBorrows.length,
        upcomingDueDatesCount: upcomingCount,
        overdueBooksCount: overdueCount,
        pendingFineAmount,
        totalFinePaid,
      },
      borrowedBooks: activeBorrows,
      fines,
      recentPayments: payments,
    });
  } catch (error) {
    next(error);
  }
};
