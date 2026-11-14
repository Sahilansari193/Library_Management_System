const mongoose = require('mongoose');

const borrowRecordSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Membership',
      required: true,
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    returnDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Issued', 'Returned', 'Overdue'],
      default: 'Issued',
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    reminderDate: {
      type: Date,
    },
    fine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Fine',
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Helper virtual to calculate overdue days on the fly
borrowRecordSchema.virtual('calculatedOverdueDays').get(function () {
  const compareDate = this.returnDate ? new Date(this.returnDate) : new Date();
  const due = new Date(this.dueDate);
  if (compareDate > due) {
    const diffTime = Math.abs(compareDate - due);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return 0;
});

module.exports = mongoose.model('BorrowRecord', borrowRecordSchema);
