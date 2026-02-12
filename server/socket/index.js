const { Server } = require('socket.io');
const RoomManager = require('../managers/RoomManager')
const registerRoomHandlers = require('./roomHandlers')
const registerGameHandlers = require('./gameHandlers')

function initSocket(httpServer) {
    const roomManager = new RoomManager();
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL,
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);
        socket.emit('welcome', {message: 'Connected', id:socket.id});

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
            if (roomManager.lookupSocketID.has(socket.id)) {
                const room = roomManager.leaveRoom(socket.id);
                if (room) {
                    io.to(room.code).emit('room:player-left', { room: roomManager.serializeRoom(room) });
                }
            }
        });

        registerRoomHandlers(io, socket, roomManager);
        registerGameHandlers(io, socket, roomManager);

        socket.on('ping', () => {
            socket.emit('pong');
        })

        socket.on('leaderboard:invalidate', (roomId) => {
            if (!socket.rooms.has(roomId)) return;
            io.to(roomId).emit('leaderboard:invalidate');
        })
    });


}

module.exports = initSocket;