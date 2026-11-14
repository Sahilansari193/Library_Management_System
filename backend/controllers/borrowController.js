const BorrowRecord = require('../models/BorrowRecord');
const Book = require('../models/Book');
const Membership = require('../models/Membership');
const Fine = require('../models/Fine');
const Notification = require('../models/Notification');
const { calculateFineAmount, getBorrowDays } = require('../services/fineCalculator');

// Helper to auto-update Overdue statuses for active borrows
const syncOverdueStatuses = async () => {
  try {
    const now = new Date();
    await BorrowRecord.updateMany(
      {
        status: 'Issued',
        dueDate: { $lt: now },
      },
      {
        $set: { status: 'Overdue' },
      }
    );
  } catch (err) {
    console.error('Error syncing overdue statuses:', err.message);
  }
};

// @desc    Get all borrow records
// @route   GET /api/borrow
// @access  Private/Admin
exports.getBorrowRecords = async (req, res, next) => {
  try {
    await syncOverdueStatuses();

    const { status, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    let records = await BorrowRecord.find(query)
      .populate('member', 'memberId fullName email phone status')
      .populate('book', 'title author isbn coverImage shelfLocation')
      .populate('fine')
      .sort({ createdAt: -1 });

    // In-memory or post-population search filter if search parameter provided
    if (search && search.trim() !== '') {
      const term = search.toLowerCase().trim();
      records = records.filter(
        (rec) =>
          rec.transactionId?.toLowerCase().includes(term) ||
          rec.member?.fullName?.toLowerCase().includes(term) ||
          rec.member?.memberId?.toLowerCase().includes(term) ||
          rec.book?.title?.toLowerCase().includes(term) ||
          rec.book?.isbn?.toLowerCase().includes(term)
      );
    }

    const total = records.length;
    const paginatedRecords = records.slice(skip, skip + limitNum);

    res.status(200).json({
      success: true,
      count: paginatedRecords.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      records: paginatedRecords,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get borrow records for currently logged in student
// @route   GET /api/borrow/my-books
// @access  Private/Student
exports.getMyBorrowRecords = async (req, res, next) => {
  try {
    await syncOverdueStatuses();

    const membership = await Membership.findOne({ user: req.user._id });
    if (!membership) {
      return res.status(200).json({
        success: true,
        records: [],
      });
    }

    const records = await BorrowRecord.find({ member: membership._id })
      .populate('book', 'title author isbn coverImage shelfLocation')
      .populate('fine')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Issue a book to a member
// @route   POST /api/borrow/issue
// @access  Private/Admin
exports.issueBook = async (req, res, next) => {
  try {
    const { bookId, memberId, customBorrowDays } = req.body;

    if (!bookId || !memberId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both book and member IDs',
      });
    }

    // 1. Verify Book
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({
        success: false,
        message: `Book "${book.title}" is currently out of stock (0 available copies)`,
      });
    }

    // 2. Verify Member
    const member = await Membership.findById(memberId).populate('user');
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    // Check expiry
    member.checkExpiry();
    await member.save();

    if (member.status === 'Expired') {
      return res.status(400).json({
        success: false,
        message: `Cannot issue book: Member's library membership has expired on ${new Date(member.expiryDate).toLocaleDateString()}. Please renew first.`,
      });
    }

    if (member.status === 'Suspended') {
      return res.status(400).json({
        success: false,
        message: 'Cannot issue book: Member account is currently suspended.',
      });
    }

    // Check if member already has this exact book currently issued
    const alreadyIssued = await BorrowRecord.findOne({
      member: member._id,
      book: book._id,
      status: { $in: ['Issued', 'Overdue'] },
    });

    if (alreadyIssued) {
      return res.status(400).json({
        success: false,
        message: `Member already holds an active copy of "${book.title}" (Txn: ${alreadyIssued.transactionId})`,
      });
    }

    // 3. Calculate Due Date (Default 14 days or custom configured)
    const configuredDays = customBorrowDays ? Number(customBorrowDays) : await getBorrowDays();
    const issueDate = new Date();
    const dueDate = new Date(issueDate.getTime() + configuredDays * 24 * 60 * 60 * 1000);

    // 4. Generate Transaction ID
    const count = await BorrowRecord.countDocuments();
    const transactionId = `TXN-${new Date().getFullYear()}-${String(count + 1001).padStart(5, '0')}`;

    // 5. Create Borrow Record
    const record = await BorrowRecord.create({
      transactionId,
      member: member._id,
      book: book._id,
      issueDate,
      dueDate,
      status: 'Issued',
      issuedBy: req.user._id,
    });

    // 6. Update Book Available Copies
    book.availableCopies = Math.max(0, book.availableCopies - 1);
    await book.save();

    // 7. Create in-app notification for the student
    if (member.user) {
      await Notification.create({
        user: member.user._id,
        member: member._id,
        borrowRecord: record._id,
        title: 'Book Issued Successfully',
        message: `You have borrowed "${book.title}". Please return or renew on or before ${dueDate.toLocaleDateString()}.`,
        type: 'General',
      });
    }

    const populatedRecord = await BorrowRecord.findById(record._id)
      .populate('member', 'memberId fullName email phone')
      .populate('book', 'title author isbn coverImage');

    res.status(201).json({
      success: true,
      record: populatedRecord,
      message: `Book "${book.title}" successfully issued to ${member.fullName}`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Return a borrowed book
// @route   PUT /api/borrow/return/:id
// @access  Private/Admin
exports.returnBook = async (req, res, next) => {
  try {
    const record = await BorrowRecord.findById(req.params.id)
      .populate('book')
      .populate('member');

    if (!record) {
      return res.status(404).json({ success: false, message: 'Borrow record not found' });
    }

    if (record.status === 'Returned') {
      return res.status(400).json({ success: false, message: 'This book has already been marked as returned' });
    }

    const returnDate = new Date();
    record.returnDate = returnDate;
    record.status = 'Returned';

    // Update book inventory
    if (record.book) {
      const book = await Book.findById(record.book._id);
      if (book) {
        book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
        await book.save();
      }
    }

    // Check fine calculation
    const fineDetails = await calculateFineAmount(record.dueDate, returnDate);

    let fineDoc = null;
    if (fineDetails.overdueDays > 0) {
      // Overdue! Create Fine record
      fineDoc = await Fine.create({
        borrowRecord: record._id,
        member: record.member._id,
        book: record.book._id,
        overdueDays: fineDetails.overdueDays,
        finePerDay: fineDetails.finePerDay,
        totalAmount: fineDetails.totalAmount,
        amountPaid: 0,
        balanceAmount: fineDetails.totalAmount,
        status: 'Pending',
      });

      record.fine = fineDoc._id;

      // In-app notification for student regarding the fine
      if (record.member.user) {
        await Notification.create({
          user: record.member.user,
          member: record.member._id,
          borrowRecord: record._id,
          title: 'Book Returned with Overdue Fine',
          message: `Book "${record.book.title}" returned ${fineDetails.overdueDays} days late. A fine of ₹${fineDetails.totalAmount} has been charged.`,
          type: 'Overdue',
        });
      }
    } else {
      // Returned on or before due date
      if (record.member.user) {
        await Notification.create({
          user: record.member.user,
          member: record.member._id,
          borrowRecord: record._id,
          title: 'Book Returned on Time',
          message: `Book "${record.book.title}" has been successfully returned. Thank you!`,
          type: 'General',
        });
      }
    }

    await record.save();

    res.status(200).json({
      success: true,
      record,
      fine: fineDoc,
      message: fineDoc
        ? `Book returned with ${fineDetails.overdueDays} overdue day(s). Fine incurred: ₹${fineDetails.totalAmount}.`
        : 'Book successfully returned on time with 0 fine.',
    });
  } catch (error) {
    next(error);
  }
};
