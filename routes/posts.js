// routes/posts.js
const express = require('express');
const router  = express.Router();

const Post   = require('../models/Post');
const auth   = require('../middleware/auth');
const role   = require('../middleware/role');
const upload = require('../middleware/uploads');

/*----------  Public routes  ----------*/

// Home-page feed (no auth required)
router.get('/public', async (req, res) => {
  try {
    const posts = await Post.find()
                            .populate('adminId', 'username avatar')   // ← avatar added
                            .sort({ createdAt: -1 })
                            .limit(20);
    const base = `${req.protocol}://${req.get('host')}/`;            // ← absolute base
    const mapped = posts.map(p => ({
      ...p.toObject(),
      image: p.image ? base + p.image : '',
      adminId: {
        ...p.adminId,
        avatar: p.adminId.avatar ? base + p.adminId.avatar : ''
      }
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

/*----------  Authenticated routes  ----------*/

// Get all posts (members + admin)
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
                            .populate('adminId', 'username avatar')
                            .sort({ createdAt: -1 });
    const base = `${req.protocol}://${req.get('host')}/`;
    const mapped = posts.map(p => ({
      ...p.toObject(),
      image: p.image ? base + p.image : '',
      adminId: {
        ...p.adminId,
        avatar: p.adminId.avatar ? base + p.adminId.avatar : ''
      }
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create post (admin only)
router.post('/', auth, role(['admin']), upload, async (req, res) => {
  try {
    const { textContent } = req.body;
    const post = await Post.create({
      adminId: req.user.id,
      textContent,
      image: req.file ? req.file.filename : ''
    });
    res.json({ msg: 'Posted', post });
  } catch (err) {
    res.status(500).json({ msg: 'Post failed' });
  }
});

// Delete post (admin only)
router.delete('/:id', auth, role(['admin']), async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Delete failed' });
  }
});

module.exports = router;