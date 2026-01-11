const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
  amount: Number,
  date: { type: Date, default: Date.now },
  remarks: String
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);