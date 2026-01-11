const express = require('express');
const bcrypt = require('bcryptjs');
const Member = require('../models/Member');
const Admin = require('../models/Admin');
const Payment = require('../models/Payment');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const upload = require('../middleware/uploads');
const router = express.Router();

/* ---------- MEMBERS CRUD ---------- */
// Get all members
router.get('/members', auth, role(['admin']), async (req, res) => {
  try {
    const members = await Member.find().lean();
    const now = new Date();
    members.forEach(m => {
      m.remainingDays = Math.ceil((new Date(m.expiryDate) - now) / (1000 * 60 * 60 * 24));
    });
    res.json(members);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Add member
router.post('/members', auth, role(['admin']), upload, async (req, res) => {
  try {
    const { fullName, phone, email, age, gender, address, subscriptionPlan, amount } = req.body;
    const exists = await Member.findOne({ email });
    if (exists) return res.status(400).json({ msg: 'Email already registered' });

    const hashed = await bcrypt.hash('123456', 12); // default password
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + (subscriptionPlan === 'Monthly' ? 30 : 90));

    const member = await Member.create({
      fullName, phone, email, age, gender, address, password: hashed,
      subscriptionPlan, expiryDate: expiry,
      profilePicture: req.file ? `uploads/members/${req.file.filename}` : 'assets/avatar.png'
    });

    res.json({ msg: 'Member added', member });
  } catch (err) {
    res.status(500).json({ msg: 'Add failed' });
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