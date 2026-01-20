const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ['Present', 'Absent'], default: 'Present' },
    checkInTime: { type: String, default: () => new Date().toLocaleTimeString() }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
