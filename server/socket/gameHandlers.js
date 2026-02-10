function registerGameHandlers(io, socket, RoomManager) {
    socket.on('game:start', (data, callback) => {
        const room = RoomManager.startGame(data.code, data.startPage, data.targetPage);
        io.to(room.code).emit('game:started', { room });
        callback({success: true, code: room.code});
    })

    socket.on('game:click', (data, callback) => {
        const { room, player } = RoomManager.recordClick(socket.id, data.newPage);
        io.to(data.code).emit('game:clicked', { room });

        if (player.isFinished) {
            io.to(data.code).emit('game:player-finished', { room });
        }

        callback({success: true, code: room.code});
    })
}

module.exports = registerGameHandlers;