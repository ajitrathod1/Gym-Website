const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Member = require('../models/Member');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Mark Attendance (Admin only for now, or use a kiosk mode)
router.post('/mark', auth, role(['admin']), async (req, res) => {
    try {
        const { memberId, status } = req.body;

        // Check if already marked for today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const existing = await Attendance.findOne({
            memberId,
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        if (existing) {
            return res.status(400).json({ msg: 'Attendance already marked for today' });
        }

        const attendance = await Attendance.create({
            memberId,
            status: status || 'Present'
        });

        res.json({ msg: 'Attendance marked', attendance });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Get Attendance History for a specific member
router.get('/history/:memberId', auth, async (req, res) => {
    try {
        // Members can only see their own
        if (req.user.role === 'member' && req.user.id !== req.params.memberId) {
            return res.status(403).json({ msg: 'Forbidden' });
        }

        const history = await Attendance.find({ memberId: req.params.memberId }).sort({ date: -1 });
        res.json(history);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Get Today's Attendance (Admin)
router.get('/today', auth, role(['admin']), async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const todayList = await Attendance.find({
            date: { $gte: startOfDay, $lte: endOfDay }
        }).populate('memberId', 'fullName email profilePicture');

        res.json(todayList);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
