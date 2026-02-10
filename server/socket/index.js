const { Server} = require('socket.io');

function initSocket(httpServer) {
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
    });
}

module.exports = initSocket;