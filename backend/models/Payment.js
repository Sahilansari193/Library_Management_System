const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    receiptNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    transactionReference: {
      type: String,
      required: true,
      trim: true,
    },
    fine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Fine',
      required: true,
    },
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Membership',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please provide payment amount'],
      min: [1, 'Payment amount must be greater than 0'],
    },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'Card', 'Cash'],
      default: 'UPI',
    },
    paymentStatus: {
      type: String,
      enum: ['Completed', 'Failed', 'Pending'],
      default: 'Completed',
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: 'Demo simulated payment received',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Payment', paymentSchema);
