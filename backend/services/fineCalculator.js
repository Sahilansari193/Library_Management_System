const Setting = require('../models/Setting');

/**
 * Get current system fine per day (defaults to 5 INR)
 */
const getFineRate = async () => {
  try {
    const setting = await Setting.findOne({ key: 'DEFAULT_FINE_PER_DAY' });
    if (setting && !isNaN(Number(setting.value))) {
      return Number(setting.value);
    }
  } catch (error) {
    console.error('Error fetching fine rate setting:', error.message);
  }
  return Number(process.env.DEFAULT_FINE_PER_DAY) || 5;
};

/**
 * Get default borrow duration in days (defaults to 14 days)
 */
const getBorrowDays = async () => {
  try {
    const setting = await Setting.findOne({ key: 'DEFAULT_BORROW_DAYS' });
    if (setting && !isNaN(Number(setting.value))) {
      return Number(setting.value);
    }
  } catch (error) {
    console.error('Error fetching borrow days setting:', error.message);
  }
  return Number(process.env.DEFAULT_BORROW_DAYS) || 14;
};

/**
 * Calculate fine details based on dueDate and reference date (returnDate or now)
 */
const calculateFineAmount = async (dueDate, referenceDate = new Date()) => {
  const finePerDay = await getFineRate();
  const due = new Date(dueDate);
  const ref = new Date(referenceDate);

  if (ref <= due) {
    return {
      overdueDays: 0,
      finePerDay,
      totalAmount: 0,
    };
  }

  const diffTime = Math.abs(ref.getTime() - due.getTime());
  const overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const totalAmount = overdueDays * finePerDay;

  return {
    overdueDays,
    finePerDay,
    totalAmount,
  };
};

module.exports = {
  getFineRate,
  getBorrowDays,
  calculateFineAmount,
};
