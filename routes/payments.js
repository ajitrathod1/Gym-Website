const express = require('express');
const Payment = require('../models/Payment');
const Member = require('../models/Member');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const router = express.Router();

// Add payment (admin only)
router.post('/', auth, role(['admin']), async (req, res) => {
  try {
    const { memberId, amount, remarks } = req.body;
    await Payment.create({ memberId, amount, remarks });
    res.json({ msg: 'Payment recorded' });
  } catch (err) {
    res.status(500).json({ msg: 'Record failed' });
  }
});

// Get payments for a specific member (member self or admin)
router.get('/member/:id', auth, async (req, res) => {
  try {
    // members can see only their own payments
    if (req.user.role === 'member' && req.user.id !== req.params.id)
      return res.status(403).json({ msg: 'Forbidden' });

    const payments = await Payment.find({ memberId: req.params.id })
                                  .sort({ date: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get all payments (admin only)
router.get('/', auth, role(['admin']), async (req, res) => {
  try {
    const payments = await Payment.find()
                                  .populate('memberId', 'fullName')
                                  .sort({ date: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;