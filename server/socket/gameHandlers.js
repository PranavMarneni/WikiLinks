const GameSession = require("../models/GameSession");

async function broadcastScoreboard(io, roomCode) {
    const sessions = await GameSession.find({ roomCode })
        .sort({ clicks: 1})
        .select('sessionId clicks completed -_id');
    io.to(roomCode).emit('leaderboard:update', sessions);
}

function registerGameHandlers(io, socket, RoomManager) {
    socket.on('game:start', async(data, callback) => {
        const room = RoomManager.startGame(data.code, data.startPage, data.targetPage);
        const ops = []
        for (const [socketID, player] of room.players) {
            ops.push({
                updateOne: {
                    filter: { sessionId: socketID},
                    update: { $set: {
                        sessionId: socketID,
                        roomCode: room.code,
                        start: room.startPage,
                        target: room.targetPage,
                    }},
                    upsert: true
                }
            })
        }
        await GameSession.bulkWrite(ops);
        await broadcastScoreboard(io, room.code);
        io.to(room.code).emit('game:started', { room: RoomManager.serializeRoom(room) });
        if (typeof callback === 'function') callback({success: true, code: room.code});
    })

    socket.on('game:click', async (data, callback) => {
        const { room, player } = RoomManager.recordClick(socket.id, data.newPage);

        await GameSession.updateOne(
            { sessionId: socket.id},
            { $inc: { clicks : 1} },
        )

        await broadcastScoreboard(io, room.code);

        io.to(room.code).emit('game:clicked', { room: RoomManager.serializeRoom(room) });
        if (player.isFinished) {
            io.to(room.code).emit('game:player-finished', { room: RoomManager.serializeRoom(room) });
            
            await GameSession.updateOne(
            { sessionId: socket.id},
            { $set: {completed: true }}
            )
        broadcastScoreboard(io, data.code);
        }
        if (typeof callback === 'function') callback({success: true, code: room.code});
    })

    socket.on('game:player-finished', async (data, callback) => {
        const { room } = RoomManager.TEMP_setPlayerFinished(socket.id);

        await GameSession.updateOne(
            { sessionId: socket.id },
            { $set: { completed: true } }
        );

        await broadcastScoreboard(io, room.code);
        io.to(room.code).emit('game:player-finished', { room: RoomManager.serializeRoom(room) });

        if (typeof callback === 'function') callback({ success: true });
    })
}


module.exports = registerGameHandlers;