const mongoose = require('mongoose');

const gameSessionSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    displayName: { type: String, default: '' },
    sessionId: { type: String, index: true },
    start: String,
    target: String,
    clicks: { type: Number, default: 0, index: true },
    quit: { type: Boolean, default: false },
    completed: { type: Boolean, default: false },
}, { timestamps: true });

gameSessionSchema.index(
    { userId: 1, start: 1, target: 1 },
    {
        unique: true,
        partialFilterExpression: {
            userId: { $type: 'string' },
            start: { $type: 'string' },
            target: { $type: 'string' },
        },
    }
);

module.exports = mongoose.model('GameSession', gameSessionSchema);