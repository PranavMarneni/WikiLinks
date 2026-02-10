const generateRoomCode = require('../utils/generateRoomCode');

class RoomManager {
    constructor() {
        this.rooms = new Map();
        this.lookupSocketID = new Map();
    }

    createRoom(playerName, socketID) {
        const roomCode = generateRoomCode();

        const room = {
            code: roomCode,
            hostID: socketID,
            status: 'lobby',
            players: new Map(),
            startPage: null,
            targetPage: null,
            creationTime: Date.now()
        }

        const player = {
            name: playerName,
            isHost: true,
            clicks: 0,
            currPage: null,
            isFinished: false,
            startTime: null,
            endTime: null
        }

        room.players.set(socketID, player);

        this.rooms.set(roomCode, room);
        this.lookupSocketID.set(socketID, roomCode);

        return room;
    }

    joinRoom(playerName, socketID, roomCode) {
        const player = {
            name: playerName,
            isHost: false,
            clicks: 0,
            currPage: null,
            isFinished: false,
            startTime: null,
            endTime: null
        }

        this.rooms.get(roomCode).players.set(socketID, player);
        this.lookupSocketID.set(socketID, roomCode);

        return this.rooms.get(roomCode);
    }

    leaveRoom(socketID) {
        let room = this.getRoom(socketID);

        if (room.players.get(socketID).isHost) {
            if (room.players.size == 1) {
                this.deleteRoom(room.code);
                return null;
            }

            let newHostID;
            let newHost;
            newHostID = room.players.keys().next().value;
            newHost = room.players.get(newHostID);
            newHost.isHost = true;
            room.hostID = newHostID;
        }
        room.players.delete(socketID);
        this.lookupSocketID.delete(socketID);
        return room;
    }

    deleteRoom(roomCode) {
        this.rooms.delete(roomCode);
        for (const [playerID, existingRoomCode] of this.lookupSocketID) {
            if (existingRoomCode == roomCode) {
                this.lookupSocketID.delete(playerID);
            }
        }
        return this.rooms;
    }

    getRoom(playerID) {
        let roomCode = this.lookupSocketID.get(playerID);
        let room = this.rooms.get(roomCode);

        return room;
    }

    startGame(roomCode, startPage, targetPage) {
        let currRoom = this.rooms.get(roomCode);
        currRoom.status = 'In Progress';
        currRoom.startPage = startPage;
        currRoom.targetPage = targetPage;

        let currTime = Date.now();
        for (const [socketId, player] of currRoom.players) {
            player.startTime = currTime;
            player.currPage = startPage;
        }

        return currRoom;
    }

    recordClick(socketID, newPage) {
        let room = this.getRoom(socketID);
        let player = room.players.get(socketID);

        player.currPage = newPage;
        player.clicks++;
        if (player.currPage == room.targetPage) {
            player.isFinished = true;
            player.endTime = Date.now();
        }
        return { room, player };
    }
}

module.exports = RoomManager;
