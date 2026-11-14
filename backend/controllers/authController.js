const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Membership = require('../models/Membership');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretjwtkey_library_system_2026', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @desc    Register a new user / student
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, address, plan } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: 'student',
      phone: phone || '',
    });

    // Auto-create Membership for new student
    const count = await Membership.countDocuments();
    const memberId = `LIB-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const startDate = new Date();
    const selectedPlan = plan || 'Annual';
    let durationDays = 365;
    if (selectedPlan === 'Monthly') durationDays = 30;
    if (selectedPlan === 'Quarterly') durationDays = 90;

    const expiryDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const membership = await Membership.create({
      memberId,
      user: user._id,
      fullName: name,
      email,
      phone: phone || 'Not provided',
      address: address || 'Campus Hostel / Residence',
      plan: selectedPlan,
      startDate,
      expiryDate,
      status: 'Active',
    });

    // Link membership to user
    user.membership = membership._id;
    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        membership: membership,
      },
      message: 'Registration successful! Library membership has been activated.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password').populate('membership');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Refresh membership expiry status if student
    if (user.membership && typeof user.membership.checkExpiry === 'function') {
      user.membership.checkExpiry();
      await user.membership.save();
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        membership: user.membership,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('membership');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        membership: user.membership,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    await user.save();

    if (user.membership && (name || phone || address)) {
      const membership = await Membership.findById(user.membership);
      if (membership) {
        if (name) membership.fullName = name;
        if (phone) membership.phone = phone;
        if (address) membership.address = address;
        await membership.save();
      }
    }

    const updatedUser = await User.findById(req.user.id).populate('membership');

    res.status(200).json({
      success: true,
      user: updatedUser,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    next(error);
  }
};
