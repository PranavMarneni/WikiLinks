const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true, index: true },
    displayName: { type: String, default: '' },
    phoneNumber: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('UserProfile', userProfileSchema);
