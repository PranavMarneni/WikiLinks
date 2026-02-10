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

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });

        registerRoomHandlers(io, socket, roomManager);
        registerGameHandlers(io, socket, roomManager);
    });
}

module.exports = initSocket;