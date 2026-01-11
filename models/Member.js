const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
  fullName: String,
  phone: String,
  email: { type: String, unique: true },
  age: Number,
  gender: String,
  address: String,
  password: String,
  joiningDate: { type: Date, default: Date.now },
  subscriptionPlan: { type: String, enum: ['Monthly', 'Custom'], default: 'Monthly' },
  expiryDate: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }, // +30 days
  profilePicture: { type: String, default: 'assets/avatar.png' }
}, { timestamps: true });

module.exports = mongoose.model('Member', MemberSchema);