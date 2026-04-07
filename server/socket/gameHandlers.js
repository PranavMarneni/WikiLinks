const GameSession = require("../models/GameSession");

let globalGame = { startPage: null, targetPage: null };

function connectedUserIds(io) {
    const ids = new Set();
    for (const [, s] of io.sockets.sockets) {
        if (s.userId) ids.add(s.userId);
    }
    return [...ids];
}

async function broadcastScoreboard(io) {
    const userIds = connectedUserIds(io);
    const sessions = await GameSession.find({
        userId: { $in: userIds },
        start: globalGame.startPage,
        target: globalGame.targetPage,
    })
        .sort({ clicks: 1 })
        .select('userId displayName clicks completed -_id');
    io.emit('leaderboard:update', sessions);
}

function registerGameHandlers(io, socket) {
    socket.on('game:start', async (data, callback) => {
        globalGame.startPage = data.startPage;
        globalGame.targetPage = data.targetPage;

        const ops = [];
        for (const [, s] of io.sockets.sockets) {
            if (!s.userId) continue;
            ops.push({
                updateOne: {
                    filter: { userId: s.userId, start: data.startPage, target: data.targetPage },
                    update: {
                        $set: {
                            userId: s.userId,
                            displayName: s.displayName || '',
                            sessionId: s.id,
                            start: data.startPage,
                            target: data.targetPage,
                            clicks: 0,
                            quit: false,
                            completed: false,
                        },
                    },
                    upsert: true,
                },
            });
        }
        if (ops.length) await GameSession.bulkWrite(ops);

        io.emit('game:started', { startPage: data.startPage, targetPage: data.targetPage });
        await broadcastScoreboard(io);

        if (typeof callback === 'function') callback({ success: true });
    });

    socket.on('game:click', async (data, callback) => {
        await GameSession.updateOne(
            { userId: socket.userId, start: globalGame.startPage, target: globalGame.targetPage },
            { $inc: { clicks: 1 } }
        );

        if (data.newPage === globalGame.targetPage) {
            await GameSession.updateOne(
                { userId: socket.userId, start: globalGame.startPage, target: globalGame.targetPage },
                { $set: { completed: true } }
            );
        }

        await broadcastScoreboard(io);
        io.emit('game:clicked');

        if (typeof callback === 'function') callback({ success: true });
    });

    socket.on('game:player-finished', async (data, callback) => {
        await GameSession.updateOne(
            { userId: socket.userId, start: globalGame.startPage, target: globalGame.targetPage },
            { $set: { completed: true } }
        );

        await broadcastScoreboard(io);

        if (typeof callback === 'function') callback({ success: true });
    });
}

module.exports = registerGameHandlers;
