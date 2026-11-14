const Membership = require('../models/Membership');
const User = require('../models/User');
const BorrowRecord = require('../models/BorrowRecord');
const Fine = require('../models/Fine');

// @desc    Get all members with search, filters and pagination
// @route   GET /api/members
// @access  Private/Admin
exports.getMembers = async (req, res, next) => {
  try {
    const { search, status, plan, page = 1, limit = 10 } = req.query;

    const query = {};

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { fullName: regex },
        { email: regex },
        { memberId: regex },
        { phone: regex },
      ];
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (plan && plan !== 'All') {
      query.plan = plan;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // First auto-check expiry dates across memberships
    const now = new Date();
    await Membership.updateMany(
      { expiryDate: { $lt: now }, status: 'Active' },
      { $set: { status: 'Expired' } }
    );

    const totalMembers = await Membership.countDocuments(query);
    const members = await Membership.find(query)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: members.length,
      total: totalMembers,
      totalPages: Math.ceil(totalMembers / limitNum) || 1,
      currentPage: pageNum,
      members,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single member details with borrowing and fine history
// @route   GET /api/members/:id
// @access  Private
exports.getMemberById = async (req, res, next) => {
  try {
    const member = await Membership.findById(req.params.id).populate('user', 'name email role phone');
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    // Auto-check expiry
    member.checkExpiry();
    await member.save();

    // Fetch member's borrowing history
    const borrowHistory = await BorrowRecord.find({ member: member._id })
      .populate('book', 'title author isbn coverImage')
      .populate('fine')
      .sort({ createdAt: -1 });

    // Fetch member's fines
    const fines = await Fine.find({ member: member._id })
      .populate('book', 'title author')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      member,
      borrowHistory,
      fines,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register new member (Admin)
// @route   POST /api/members
// @access  Private/Admin
exports.createMember = async (req, res, next) => {
  try {
    const { fullName, email, phone, address, plan, password } = req.body;

    if (!fullName || !email || !phone || !address) {
      return res.status(400).json({ success: false, message: 'Please provide all required member details' });
    }

    const existingUser = await User.findOne({ email });
    let user;

    if (existingUser) {
      if (existingUser.membership) {
        return res.status(400).json({
          success: false,
          message: 'A member with this email is already registered',
        });
      }
      user = existingUser;
    } else {
      user = await User.create({
        name: fullName,
        email,
        password: password || 'Student@123',
        role: 'student',
        phone,
      });
    }

    const count = await Membership.countDocuments();
    const memberId = `LIB-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const startDate = new Date();
    const selectedPlan = plan || 'Annual';
    let durationDays = 365;
    if (selectedPlan === 'Monthly') durationDays = 30;
    if (selectedPlan === 'Quarterly') durationDays = 90;

    const expiryDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const member = await Membership.create({
      memberId,
      user: user._id,
      fullName,
      email,
      phone,
      address,
      plan: selectedPlan,
      startDate,
      expiryDate,
      status: 'Active',
    });

    user.membership = member._id;
    await user.save();

    res.status(201).json({
      success: true,
      member,
      message: `Member registered successfully with ID: ${memberId}`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update member details
// @route   PUT /api/members/:id
// @access  Private/Admin
exports.updateMember = async (req, res, next) => {
  try {
    const { fullName, phone, address, status, plan } = req.body;

    const member = await Membership.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    if (fullName) member.fullName = fullName;
    if (phone) member.phone = phone;
    if (address) member.address = address;
    if (status) member.status = status;
    if (plan) member.plan = plan;

    await member.save();

    res.status(200).json({
      success: true,
      member,
      message: 'Member details updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Renew or extend membership
// @route   POST /api/members/:id/renew
// @access  Private/Admin
exports.renewMembership = async (req, res, next) => {
  try {
    const { plan } = req.body;
    const member = await Membership.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    const selectedPlan = plan || member.plan || 'Annual';
    let durationDays = 365;
    if (selectedPlan === 'Monthly') durationDays = 30;
    if (selectedPlan === 'Quarterly') durationDays = 90;

    // Start renewal from today or from previous expiry if expiry is still in future
    const baseDate = new Date(member.expiryDate) > new Date() ? new Date(member.expiryDate) : new Date();
    const newExpiry = new Date(baseDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

    member.plan = selectedPlan;
    member.expiryDate = newExpiry;
    member.status = 'Active';

    await member.save();

    res.status(200).json({
      success: true,
      member,
      message: `Membership renewed successfully until ${newExpiry.toLocaleDateString()}`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete or deactivate member
// @route   DELETE /api/members/:id
// @access  Private/Admin
exports.deleteMember = async (req, res, next) => {
  try {
    const member = await Membership.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    // Check if member has books currently issued
    const activeBorrows = await BorrowRecord.countDocuments({
      member: member._id,
      status: { $in: ['Issued', 'Overdue'] },
    });

    if (activeBorrows > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete member: Member currently has ${activeBorrows} book(s) issued. Please return them first.`,
      });
    }

    // Check if member has pending fines
    const pendingFines = await Fine.countDocuments({
      member: member._id,
      status: 'Pending',
    });

    if (pendingFines > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete member: Member has pending unpaid library fines.',
      });
    }

    // Unlink from user and delete membership
    await User.findByIdAndUpdate(member.user, { $unset: { membership: 1 } });
    await member.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Member removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
