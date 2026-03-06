const { Server } = require('socket.io');
const registerGameHandlers = require('./gameHandlers');
const GameSession = require('../models/GameSession');

function initSocket(httpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL,
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', async (socket) => {
        console.log('Client connected:', socket.id);
        socket.emit('welcome', { message: 'Connected', id: socket.id });

        await GameSession.updateOne(
            { sessionId: socket.id },
            { $set: { sessionId: socket.id } },
            { upsert: true }
        );

        socket.on('disconnect', async () => {
            console.log('Client disconnected:', socket.id);

            const session = await GameSession.findOne({ sessionId: socket.id });
            if (session && !session.completed) {
                await GameSession.updateOne(
                    { sessionId: socket.id },
                    { $set: { quit: true } }
                );
            }
        });

        socket.on('ping', () => {
            socket.emit('pong');
        });

        registerGameHandlers(io, socket);
    });
}

module.exports = initSocket;
