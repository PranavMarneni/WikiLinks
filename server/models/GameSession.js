const mongoose = require('mongoose');

const gameSessionSchema = new mongoose.Schema({
    sessionId: {type: String, index: true, unique: true},
    start: String,
    target: String,
    clicks: {type: Number, default: 0, index: true},
    quit: {type: Boolean, default: false},
    completed: {type: Boolean, default: false},
}, {timestamps: true})



module.exports = mongoose.model('GameSession', gameSessionSchema)