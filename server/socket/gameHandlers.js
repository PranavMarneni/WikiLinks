function registerGameHandlers(io, socket, RoomManager) {
    socket.on('game:start', (data, callback) => {
        const room = RoomManager.startGame(data.code, data.startPage, data.targetPage);
        io.to(room.code).emit('game:started', { room: RoomManager.serializeRoom(room) });
        if (typeof callback === 'function') callback({success: true, code: room.code});
    })

    socket.on('game:click', (data, callback) => {
        const { room, player } = RoomManager.recordClick(socket.id, data.newPage);
        io.to(room.code).emit('game:clicked', { room: RoomManager.serializeRoom(room) });

        if (player.isFinished) {
            io.to(room.code).emit('game:player-finished', { room: RoomManager.serializeRoom(room) });
        }

        if (typeof callback === 'function') callback({success: true, code: room.code});
    })
}

module.exports = registerGameHandlers;