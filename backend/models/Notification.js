const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Membership',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['DueSoon', 'DueToday', 'Overdue', 'Payment', 'Membership', 'General'],
      default: 'General',
    },
    read: {
      type: Boolean,
      default: false,
    },
    borrowRecord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BorrowRecord',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
