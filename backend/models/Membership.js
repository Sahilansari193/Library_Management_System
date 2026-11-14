const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema(
  {
    memberId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fullName: {
      type: String,
      required: [true, 'Please provide member name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide member email'],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide contact number'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Please provide residential/hostel address'],
      trim: true,
    },
    plan: {
      type: String,
      enum: ['Monthly', 'Quarterly', 'Annual'],
      default: 'Annual',
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Expired', 'Suspended'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

// Method to verify and auto-update expiry status
membershipSchema.methods.checkExpiry = function () {
  if (this.status !== 'Suspended') {
    if (new Date() > new Date(this.expiryDate)) {
      this.status = 'Expired';
    } else {
      this.status = 'Active';
    }
  }
  return this.status;
};

module.exports = mongoose.model('Membership', membershipSchema);
