const { Server } = require('socket.io');
const admin = require('../config/firebase');
const registerGameHandlers = require('./gameHandlers');
const GameSession = require('../models/GameSession');

function initSocket(httpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL,
            methods: ["GET", "POST"]
        }
    });

    io.use(async (socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) {
            return next(new Error('Authentication required'));
        }
        try {
            const decoded = await admin.auth().verifyIdToken(token);
            socket.userId = decoded.uid;
            socket.displayName = decoded.name || decoded.email || 'Anonymous';
            next();
        } catch (err) {
            console.error('Socket auth failed:', err.message);
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', async (socket) => {
        console.log(`Client connected: ${socket.id} (user: ${socket.userId})`);
        socket.emit('welcome', {
            message: 'Connected',
            id: socket.id,
            userId: socket.userId,
            displayName: socket.displayName,
        });

        socket.on('disconnect', async () => {
            console.log(`Client disconnected: ${socket.id} (user: ${socket.userId})`);

            const session = await GameSession.findOne({
                userId: socket.userId,
                completed: false,
                quit: false,
            });
            if (session) {
                session.quit = true;
                await session.save();
            }
        });

        socket.on('ping', () => {
            socket.emit('pong');
        });

        registerGameHandlers(io, socket);
    });
}

module.exports = initSocket;
