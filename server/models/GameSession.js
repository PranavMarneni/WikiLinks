const mongoose = require('mongoose');

const gameSessionSchema = new mongoose.Schema({
    sessionId: {type: String, index: true},
    roomCode: String,
    start: String,
    target: String,
    clicks: {type: Number, default: 0, index: true},
    completed: {type: Boolean, default: false},
}, {timestamps: true})



module.exports = mongoose.model('GameSession', gameSessionSchema)