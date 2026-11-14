const Book = require('../models/Book');
const Membership = require('../models/Membership');
const BorrowRecord = require('../models/BorrowRecord');
const Fine = require('../models/Fine');
const Payment = require('../models/Payment');

// @desc    Get comprehensive library reports and analytics
// @route   GET /api/reports/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      };
    }

    // 1. Book inventory by category
    const booksByCategory = await Book.aggregate([
      {
        $group: {
          _id: '$category',
          totalBooks: { $sum: 1 },
          totalCopies: { $sum: '$totalCopies' },
          availableCopies: { $sum: '$availableCopies' },
        },
      },
      { $sort: { totalCopies: -1 } },
    ]);

    // 2. Memberships by status and plan
    const membershipsByStatus = await Membership.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const membershipsByPlan = await Membership.aggregate([
      {
        $group: {
          _id: '$plan',
          count: { $sum: 1 },
        },
      },
    ]);

    // 3. Monthly Borrowing Statistics (Last 12 Months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyBorrowing = await BorrowRecord.aggregate([
      { $match: { issueDate: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$issueDate' },
            month: { $month: '$issueDate' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // 4. Monthly Fine Collections
    const monthlyFineCollections = await Payment.aggregate([
      { $match: { paymentDate: { $gte: twelveMonthsAgo }, paymentStatus: 'Completed' } },
      {
        $group: {
          _id: {
            year: { $year: '$paymentDate' },
            month: { $month: '$paymentDate' },
          },
          totalAmount: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // 5. Most Borrowed Books (Top 10)
    const mostBorrowedBooks = await BorrowRecord.aggregate([
      {
        $group: {
          _id: '$book',
          borrowCount: { $sum: 1 },
        },
      },
      { $sort: { borrowCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'books',
          localField: '_id',
          foreignField: '_id',
          as: 'bookDetails',
        },
      },
      { $unwind: '$bookDetails' },
      {
        $project: {
          _id: 1,
          borrowCount: 1,
          title: '$bookDetails.title',
          author: '$bookDetails.author',
          isbn: '$bookDetails.isbn',
          category: '$bookDetails.category',
        },
      },
    ]);

    // 6. Overdue Book Reports summary
    const overdueReport = await BorrowRecord.find({ status: 'Overdue' })
      .populate('book', 'title author isbn')
      .populate('member', 'fullName memberId phone email')
      .sort({ dueDate: 1 });

    // 7. Pending Fines Report summary
    const pendingFinesReport = await Fine.find({ status: { $in: ['Pending', 'Partially Paid'] } })
      .populate('book', 'title author')
      .populate('member', 'fullName memberId phone')
      .sort({ balanceAmount: -1 });

    res.status(200).json({
      success: true,
      booksByCategory,
      membershipsByStatus,
      membershipsByPlan,
      monthlyBorrowing,
      monthlyFineCollections,
      mostBorrowedBooks,
      overdueReport,
      pendingFinesReport,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export specific dataset to CSV
// @route   GET /api/reports/export/:type
// @access  Private/Admin
exports.exportReportCSV = async (req, res, next) => {
  try {
    const { type } = req.params;
    let csvContent = '';
    let filename = `library_report_${type}_${Date.now()}.csv`;

    if (type === 'books') {
      const books = await Book.find().sort({ title: 1 });
      csvContent = 'Title,Author,ISBN,Category,Publisher,Year,Total Copies,Available Copies,Shelf Location\n';
      books.forEach((b) => {
        csvContent += `"${(b.title || '').replace(/"/g, '""')}","${(b.author || '').replace(/"/g, '""')}","${b.isbn}","${b.category}","${(b.publisher || '').replace(/"/g, '""')}",${b.publicationYear},${b.totalCopies},${b.availableCopies},"${b.shelfLocation}"\n`;
      });
    } else if (type === 'members') {
      const members = await Membership.find().sort({ memberId: 1 });
      csvContent = 'Member ID,Full Name,Email,Phone,Plan,Start Date,Expiry Date,Status\n';
      members.forEach((m) => {
        csvContent += `"${m.memberId}","${(m.fullName || '').replace(/"/g, '""')}","${m.email}","${m.phone}","${m.plan}","${new Date(m.startDate).toLocaleDateString()}","${new Date(m.expiryDate).toLocaleDateString()}","${m.status}"\n`;
      });
    } else if (type === 'borrows') {
      const records = await BorrowRecord.find()
        .populate('book', 'title isbn')
        .populate('member', 'memberId fullName')
        .sort({ issueDate: -1 });
      csvContent = 'Transaction ID,Member ID,Member Name,Book Title,ISBN,Issue Date,Due Date,Return Date,Status\n';
      records.forEach((r) => {
        const retDate = r.returnDate ? new Date(r.returnDate).toLocaleDateString() : 'N/A';
        csvContent += `"${r.transactionId}","${r.member?.memberId || 'N/A'}","${(r.member?.fullName || '').replace(/"/g, '""')}","${(r.book?.title || '').replace(/"/g, '""')}","${r.book?.isbn || 'N/A'}","${new Date(r.issueDate).toLocaleDateString()}","${new Date(r.dueDate).toLocaleDateString()}","${retDate}","${r.status}"\n`;
      });
    } else if (type === 'fines') {
      const fines = await Fine.find()
        .populate('book', 'title')
        .populate('member', 'memberId fullName')
        .populate('borrowRecord', 'transactionId')
        .sort({ createdAt: -1 });
      csvContent = 'Transaction ID,Member ID,Member Name,Book Title,Overdue Days,Fine Per Day,Total Amount,Paid,Balance,Status\n';
      fines.forEach((f) => {
        csvContent += `"${f.borrowRecord?.transactionId || 'N/A'}","${f.member?.memberId || 'N/A'}","${(f.member?.fullName || '').replace(/"/g, '""')}","${(f.book?.title || '').replace(/"/g, '""')}",${f.overdueDays},${f.finePerDay},${f.totalAmount},${f.amountPaid || 0},${f.balanceAmount || 0},"${f.status}"\n`;
      });
    } else if (type === 'payments') {
      const payments = await Payment.find()
        .populate('member', 'memberId fullName')
        .sort({ paymentDate: -1 });
      csvContent = 'Receipt Number,Transaction Ref,Member ID,Member Name,Amount (INR),Payment Method,Status,Payment Date\n';
      payments.forEach((p) => {
        csvContent += `"${p.receiptNumber}","${p.transactionReference}","${p.member?.memberId || 'N/A'}","${(p.member?.fullName || '').replace(/"/g, '""')}",${p.amount},"${p.paymentMethod}","${p.paymentStatus}","${new Date(p.paymentDate).toLocaleDateString()}"\n`;
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid report export type' });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};
