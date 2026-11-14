const BorrowRecord = require('../models/BorrowRecord');
const Notification = require('../models/Notification');

// @desc    Get all due date reminders categorized (Due Soon, Due Today, Overdue)
// @route   GET /api/reminders
// @access  Private/Admin
exports.getReminders = async (req, res, next) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const threeDaysLater = new Date(todayEnd.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Fetch all active issued/overdue borrow records
    const records = await BorrowRecord.find({
      status: { $in: ['Issued', 'Overdue'] },
      returnDate: { $exists: false },
    })
      .populate('member', 'memberId fullName email phone status user')
      .populate('book', 'title author isbn coverImage shelfLocation')
      .sort({ dueDate: 1 });

    const dueSoon = [];
    const dueToday = [];
    const overdue = [];

    records.forEach((record) => {
      const due = new Date(record.dueDate);
      const diffTime = due.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const recordObj = record.toObject();
      recordObj.diffDays = diffDays;

      if (due < todayStart) {
        recordObj.category = 'Overdue';
        recordObj.overdueDays = Math.abs(diffDays);
        overdue.push(recordObj);
      } else if (due >= todayStart && due <= todayEnd) {
        recordObj.category = 'Due Today';
        recordObj.remainingDays = 0;
        dueToday.push(recordObj);
      } else if (due > todayEnd && due <= threeDaysLater) {
        recordObj.category = 'Due Soon';
        recordObj.remainingDays = diffDays;
        dueSoon.push(recordObj);
      }
    });

    res.status(200).json({
      success: true,
      summary: {
        totalDueSoon: dueSoon.length,
        totalDueToday: dueToday.length,
        totalOverdue: overdue.length,
      },
      dueSoon,
      dueToday,
      overdue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark reminder as sent and dispatch in-app notification to member
// @route   POST /api/reminders/:id/send
// @access  Private/Admin
exports.sendReminder = async (req, res, next) => {
  try {
    const record = await BorrowRecord.findById(req.params.id)
      .populate('member')
      .populate('book');

    if (!record) {
      return res.status(404).json({ success: false, message: 'Borrow record not found' });
    }

    const now = new Date();
    const due = new Date(record.dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let title = 'Library Book Due Date Reminder';
    let message = '';
    let notificationType = 'General';

    if (diffDays < 0) {
      title = 'URGENT: Overdue Library Book Alert';
      message = `Your borrowed book "${record.book.title}" is overdue by ${Math.abs(diffDays)} day(s). Fines are accumulating at ₹5/day. Please return immediately.`;
      notificationType = 'Overdue';
    } else if (diffDays === 0) {
      title = 'Notice: Book Due Today';
      message = `Your borrowed book "${record.book.title}" is due today (${due.toLocaleDateString()}). Please return to the library counter to avoid overdue fines.`;
      notificationType = 'DueToday';
    } else {
      title = 'Upcoming Due Date Reminder';
      message = `Friendly reminder: Your borrowed book "${record.book.title}" is due in ${diffDays} day(s) on ${due.toLocaleDateString()}.`;
      notificationType = 'DueSoon';
    }

    // Update BorrowRecord reminder flag
    record.reminderSent = true;
    record.reminderDate = now;
    await record.save();

    // Create Notification if member is tied to a user account
    if (record.member && record.member.user) {
      await Notification.create({
        user: record.member.user,
        member: record.member._id,
        borrowRecord: record._id,
        title,
        message,
        type: notificationType,
      });
    }

    res.status(200).json({
      success: true,
      message: `Reminder successfully sent to ${record.member?.fullName} (${record.member?.email})`,
      record,
    });
  } catch (error) {
    next(error);
  }
};
