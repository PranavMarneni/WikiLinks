import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:3001';

let socket = null;

export function connectSocket(token) {
    if (socket) socket.disconnect();

    socket = io(API_URL, {
        auth: { token },
    });

    return socket;
}

export function getSocket() {
    return socket;
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}