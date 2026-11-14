const mongoose = require('mongoose');

const fineSchema = new mongoose.Schema(
  {
    borrowRecord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BorrowRecord',
      required: true,
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
    overdueDays: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    finePerDay: {
      type: Number,
      required: true,
      default: 5,
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    balanceAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Pending', 'Paid', 'Waived', 'Partially Paid'],
      default: 'Pending',
    },
    waivedReason: {
      type: String,
      default: '',
    },
    waivedAt: {
      type: Date,
    },
    waivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Fine', fineSchema);
