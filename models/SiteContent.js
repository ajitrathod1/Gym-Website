const mongoose = require('mongoose');

// Schema for dynamic website content (CMS)
const SiteContentSchema = new mongoose.Schema({
    section: { type: String, required: true, unique: true }, // e.g., 'home_hero', 'about_us', 'contact_info'
    title: String,
    subtitle: String,
    body: String, // Can contain HTML
    imageUrl: String,
    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SiteContent', SiteContentSchema);
