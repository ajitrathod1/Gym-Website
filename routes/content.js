const express = require('express');
const router = express.Router();
const SiteContent = require('../models/SiteContent');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const upload = require('../middleware/uploads');

// Get Content (Public)
router.get('/:section', async (req, res) => {
    try {
        const content = await SiteContent.findOne({ section: req.params.section });
        if (!content) return res.status(404).json({ msg: 'Content not found' });
        res.json(content);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Update Content (Admin Only)
router.put('/:section', auth, role(['admin']), upload, async (req, res) => {
    try {
        const { title, subtitle, body } = req.body;
        const updateData = {
            title,
            subtitle,
            body,
            lastUpdatedBy: req.user.id,
            updatedAt: Date.now()
        };

        if (req.file) {
            updateData.imageUrl = req.file.filename;
        }

        const content = await SiteContent.findOneAndUpdate(
            { section: req.params.section },
            updateData,
            { new: true, upsert: true } // Create if not exists
        );

        res.json({ msg: 'Content updated', content });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Update failed' });
    }
});

module.exports = router;
