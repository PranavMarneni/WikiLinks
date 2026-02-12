function registerRoomHandlers(io, socket, RoomManager) {
    socket.on('room:create', (data, callback) => {
        const room = RoomManager.createRoom(data.playerName, socket.id);
        socket.join(room.code);
        callback({success: true, code: room.code});
    })

    socket.on('room:join', (data, callback) => {
        if (!RoomManager.rooms.has(data.roomId)) {
            return callback({ success: false, error: 'Room not found' });
        }
        const room = RoomManager.joinRoom(data.playerName, socket.id, data.roomId);
        socket.join(room.code);
        io.to(room.code).emit('room:joined', { room: RoomManager.serializeRoom(room) });
        callback({success: true, code: room.code});
    })

    socket.on('room:leave', (callback) => {
        const room = RoomManager.leaveRoom(socket.id);
        if (room) {
            io.to(room.code).emit('room:player-left', { room: RoomManager.serializeRoom(room) });
            socket.leave(room.code)
            callback({success: true, code: room.code});
        } else {
            callback({success: true, code: null});
        }
    })
}

module.exports = registerRoomHandlers