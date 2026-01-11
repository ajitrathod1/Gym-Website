const express = require('express');
const Member = require('../models/Member');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const upload = require('../middleware/uploads');
const router = express.Router();

// Get own profile
router.get('/profile', auth, role(['member']), async (req, res) => {
  try {
    const user = await Member.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update profile  (pic path ➜ leading slash)
router.put('/profile', auth, role(['member']), upload, async (req, res) => {
  try {
    const updates = req.body;
    if (req.file) updates.profilePicture = `/${req.file.filename}`;   // ← slash add
    const updated = await Member.findByIdAndUpdate(req.user.id, updates, { new: true });
    res.json({ msg: 'Profile updated', profilePicture: updated.profilePicture });
  } catch (err) {
    res.status(500).json({ msg: 'Update failed' });
  }
});

module.exports = router;