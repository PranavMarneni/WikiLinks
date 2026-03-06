const GameSession = require("../models/GameSession");

let globalGame = { startPage: null, targetPage: null };

async function broadcastScoreboard(io) {
    const sessions = await GameSession.find({ quit: { $ne: true } })
        .sort({ clicks: 1 })
        .select('sessionId clicks completed -_id');
    io.emit('leaderboard:update', sessions);
}

function registerGameHandlers(io, socket) {
    socket.on('game:start', async (data, callback) => {
        globalGame.startPage = data.startPage;
        globalGame.targetPage = data.targetPage;

        const ops = [];
        for (const [socketId] of io.sockets.sockets) {
            ops.push({
                updateOne: {
                    filter: { sessionId: socketId },
                    update: { $set: {
                        sessionId: socketId,
                        start: data.startPage,
                        target: data.targetPage,
                    }},
                    upsert: true
                }
            });
        }
        await GameSession.bulkWrite(ops);

        io.emit('game:started', { startPage: data.startPage, targetPage: data.targetPage });
        await broadcastScoreboard(io);

        if (typeof callback === 'function') callback({ success: true });
    });

    socket.on('game:click', async (data, callback) => {
        await GameSession.updateOne(
            { sessionId: socket.id },
            { $inc: { clicks: 1 } }
        );

        if (data.newPage === globalGame.targetPage) {
            await GameSession.updateOne(
                { sessionId: socket.id },
                { $set: { completed: true } }
            );
        }

        await broadcastScoreboard(io);
        io.emit('game:clicked');

        if (typeof callback === 'function') callback({ success: true });
    });

    socket.on('game:player-finished', async (data, callback) => {
        await GameSession.updateOne(
            { sessionId: socket.id },
            { $set: { completed: true } }
        );

        await broadcastScoreboard(io);

        if (typeof callback === 'function') callback({ success: true });
    });
}

module.exports = registerGameHandlers;
