const express = require('express');
const bcrypt = require('bcryptjs');
const Member = require('../models/Member');
const Admin = require('../models/Admin');
const Payment = require('../models/Payment');
const Attendance = require('../models/Attendance');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const upload = require('../middleware/uploads');
const router = express.Router();

/* ---------- ANALYTICS & STATS ---------- */
router.get('/stats', auth, role(['admin']), async (req, res) => {
  try {
    const totalMembers = await Member.countDocuments();

    // Revenue (Sum of all payments)
    const payments = await Payment.find();
    const totalRevenue = payments.reduce((acc, p) => acc + (p.amount || 0), 0);

    // Expiring Soon (Next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const expiringSoon = await Member.countDocuments({
      expiryDate: { $lte: nextWeek, $gte: new Date() }
    });

    // Real Weekly Footfall (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const attendanceData = await Attendance.aggregate([
      { $match: { date: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Map to last 7 days array (Mon, Tue, etc. labels handled by frontend usually, we just send counts)
    // But to ensure order, we iterate from 7 days ago to today
    const weeklyFootfall = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const record = attendanceData.find(r => r._id === dateStr);
      weeklyFootfall.push(record ? record.count : 0);
    }

    res.json({
      totalMembers,
      totalRevenue,
      expiringSoon,
      weeklyFootfall
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Stats failed' });
  }
});

/* ---------- MEMBERS CRUD ---------- */
// Get all members
router.get('/members', auth, role(['admin']), async (req, res) => {
  try {
    const members = await Member.find().lean();
    const now = new Date();

    // Attach latest payment info if needed, or just rely on global stats
    // For now, calculating remaining days
    members.forEach(m => {
      m.remainingDays = Math.ceil((new Date(m.expiryDate) - now) / (1000 * 60 * 60 * 24));
    });
    res.json(members);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Add member (Now records Payment)
router.post('/members', auth, role(['admin']), upload, async (req, res) => {
  try {
    const { fullName, phone, email, age, gender, address, subscriptionPlan, amount } = req.body;
    const exists = await Member.findOne({ email });
    if (exists) return res.status(400).json({ msg: 'Email already registered' });

    const hashed = await bcrypt.hash('123456', 12);
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + (subscriptionPlan === 'Monthly' ? 30 : 90));

    const member = await Member.create({
      fullName, phone, email, age, gender, address, password: hashed,
      subscriptionPlan, expiryDate: expiry,
      profilePicture: req.file ? req.file.filename : 'assets/avatar.png'
    });

    // RECORD PAYMENT
    if (amount > 0) {
      await Payment.create({
        memberId: member._id,
        amount: Number(amount),
        date: new Date(),
        remarks: `Joining Fee - ${subscriptionPlan}`
      });
    }

    res.json({ msg: 'Member added & Payment recorded', member });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Add failed', error: err.message });
  }
});

// Delete member
router.delete('/members/:id', auth, role(['admin']), async (req, res) => {
  try {
    await Member.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Delete failed' });
  }
});

// Update subscription
router.put('/members/:id/subscription', auth, role(['admin']), async (req, res) => {
  try {
    const { expiryDate, subscriptionPlan } = req.body;
    await Member.findByIdAndUpdate(req.params.id, {
      expiryDate: new Date(expiryDate),
      subscriptionPlan
    });
    res.json({ msg: 'Updated' });
  } catch (err) {
    res.status(500).json({ msg: 'Update failed' });
  }
});

/* ---------- ADMIN PROFILE ---------- */
router.get('/profile', auth, role(['admin']), async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select('-password');
    res.json(admin);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.put('/profile', auth, role(['admin']), async (req, res) => {
  try {
    const { username } = req.body;
    await Admin.findByIdAndUpdate(req.user.id, { username });
    res.json({ msg: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ msg: 'Update failed' });
  }
});

module.exports = router;