const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    assignerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    type: { type: String, enum: ['Workout', 'Diet'], required: true },
    title: { type: String, required: true },
    content: { type: String, required: true }, // Can be HTML or detailed text
    startDate: { type: Date, default: Date.now },
    endDate: Date,
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Plan', PlanSchema);
