const mongoose = require('mongoose');

const challengeItemSchema = new mongoose.Schema({
    start: { type: String, required: true },
    end: { type: String, required: true },
}, { _id: false });

const challengesSchema = new mongoose.Schema({
    _id: { type: String, default: 'current' },
    challenges: { type: [challengeItemSchema], required: true },
}, { timestamps: true });

module.exports = mongoose.model('Challenges', challengesSchema);
