const express = require('express');
const router = express.Router();
const Plan = require('../models/Plan');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Assign a Plan (Admin only)
router.post('/', auth, role(['admin']), async (req, res) => {
    try {
        const { memberId, type, title, content, endDate } = req.body;

        const plan = await Plan.create({
            memberId,
            assignerId: req.user.id,
            type,
            title,
            content,
            endDate: endDate ? new Date(endDate) : null
        });

        res.json({ msg: 'Plan assigned successfully', plan });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Get My Plans (Member)
router.get('/my-plans', auth, async (req, res) => {
    try {
        const plans = await Plan.find({ memberId: req.user.id, isActive: true })
            .sort({ createdAt: -1 });
        res.json(plans);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Get Plans for a speicific member (Admin)
router.get('/member/:id', auth, role(['admin']), async (req, res) => {
    try {
        const plans = await Plan.find({ memberId: req.params.id })
            .sort({ createdAt: -1 });
        res.json(plans);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Delete a plan
router.delete('/:id', auth, role(['admin']), async (req, res) => {
    try {
        await Plan.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Plan deleted' });
    } catch (err) {
        res.status(500).json({ msg: 'Delete failed' });
    }
});

module.exports = router;
