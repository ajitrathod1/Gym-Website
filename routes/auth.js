const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Member = require('../models/Member');
const Admin = require('../models/Admin');
const auth = require('../middleware/auth');
const router = express.Router();

/* ---------- NODEMAILER SETUP ---------- */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
});

/* ---------- HELPERS ---------- */
const generateOTP = () => crypto.randomInt(100000, 999999).toString();
const OTP_STORE = new Map(); // in-mem store (use redis in prod)

/* ---------- PUBLIC ROUTES ---------- */
// Member register
router.post('/register', async (req, res) => {
  try {
    const { fullName, phone, email, age, gender, password } = req.body;
    const exists = await Member.findOne({ email });
    if (exists) return res.status(400).json({ msg: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 12);
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30); // +30 days

    const member = await Member.create({
      fullName, phone, email, age, gender, password: hashed,
      expiryDate: expiry // explicitly saved
    });

    res.json({ msg: 'Registration successful', memberId: member._id });
  } catch (e) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Universal login (returns role + token)
router.post('/login', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    let user, role;
    if (username) {
      user = await Admin.findOne({ username });
      role = 'admin';
    } else {
      user = await Member.findOne({ email });
      role = 'member';
    }
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ msg: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, role, user: { id: user._id, name: role === 'admin' ? user.username : user.fullName } });
  } catch (e) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Forgot password (OTP) – member only
router.post('/forgot', async (req, res) => {
  const { email } = req.body;
  const member = await Member.findOne({ email });
  if (!member) return res.status(400).json({ msg: 'Email not found' });
  const otp = generateOTP();
  OTP_STORE.set(email, { otp, exp: Date.now() + 5 * 60 * 1000 });
  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: email,
    subject: 'Smart Gym – Password Reset OTP',
    html: `<p>Your OTP is <b>${otp}</b>. Valid for 5 minutes.</p>`
  });
  res.json({ msg: 'OTP sent to email' });
});

// Reset password with OTP
router.post('/reset', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const data = OTP_STORE.get(email);
  if (!data || data.exp < Date.now() || data.otp !== otp)
    return res.status(400).json({ msg: 'Invalid or expired OTP' });
  const hashed = await bcrypt.hash(newPassword, 12);
  await Member.updateOne({ email }, { password: hashed });
  OTP_STORE.delete(email);
  res.json({ msg: 'Password reset successful' });
});

/* ---------- PROTECTED ---------- */
// Change password (universal)
router.post('/change-password', auth, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const Model = req.user.role === 'admin' ? Admin : Member;
  const user = await Model.findById(req.user.id);
  const ok = await bcrypt.compare(oldPassword, user.password);
  if (!ok) return res.status(400).json({ msg: 'Old password incorrect' });
  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();
  res.json({ msg: 'Password changed' });
});

module.exports = router;