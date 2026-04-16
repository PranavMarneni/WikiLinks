const GameSession = require("../models/GameSession");

let globalGame = { startPage: null, targetPage: null };

function setGlobalGame(startPage, targetPage) {
    globalGame = { startPage, targetPage };
}

function resetGlobalGame() {
    globalGame = { startPage: null, targetPage: null };
}

function getGlobalGame() {
    return { ...globalGame };
}

function hasActiveGame() {
    return Boolean(globalGame.startPage && globalGame.targetPage);
}

function gameFilterForUser(userId) {
    return {
        userId,
        start: globalGame.startPage,
        target: globalGame.targetPage,
    };
}

function connectedPlayers(io) {
    const players = new Map();
    for (const [, socket] of io.sockets.sockets) {
        if (!socket.userId) continue;
        players.set(socket.userId, {
            userId: socket.userId,
            displayName: socket.displayName || "",
            sessionId: socket.id,
        });
    }
    return [...players.values()];
}

async function ensurePlayerSession(model, player, extraUpdate = {}) {
    if (!hasActiveGame()) {
        return;
    }

    await model.updateOne(
        gameFilterForUser(player.userId),
        {
            $set: {
                userId: player.userId,
                displayName: player.displayName || "",
                sessionId: player.sessionId,
                start: globalGame.startPage,
                target: globalGame.targetPage,
                ...extraUpdate,
            },
            $setOnInsert: {
                clicks: 0,
                quit: false,
                completed: false,
            },
        },
        { upsert: true }
    );
}

async function broadcastScoreboard(io, model = GameSession) {
    const userIds = connectedPlayers(io).map((player) => player.userId);
    const sessions = await model.find({
        userId: { $in: userIds },
        start: globalGame.startPage,
        target: globalGame.targetPage,
    })
        .sort({ clicks: 1 })
        .select("userId displayName clicks completed -_id");
    io.emit("leaderboard:update", sessions);
}

async function handleGameStart(io, data, callback, model = GameSession) {
    setGlobalGame(data.startPage, data.targetPage);

    const players = connectedPlayers(io);
    const ops = players.map((player) => ({
        updateOne: {
            filter: gameFilterForUser(player.userId),
            update: {
                $set: {
                    userId: player.userId,
                    displayName: player.displayName || "",
                    sessionId: player.sessionId,
                    start: data.startPage,
                    target: data.targetPage,
                    clicks: 0,
                    quit: false,
                    completed: false,
                },
            },
            upsert: true,
        },
    }));

    if (ops.length) {
        await model.bulkWrite(ops);
    }

    io.emit("game:started", { startPage: data.startPage, targetPage: data.targetPage });
    await broadcastScoreboard(io, model);

    if (typeof callback === "function") {
        callback({ success: true });
    }
}

async function handleGameClick(io, socket, data, callback, model = GameSession) {
    if (!hasActiveGame()) {
        if (typeof callback === "function") {
            callback({ success: false, error: "No active game" });
        }
        return;
    }

    await ensurePlayerSession(model, {
        userId: socket.userId,
        displayName: socket.displayName,
        sessionId: socket.id,
    });

    await model.updateOne(
        gameFilterForUser(socket.userId),
        {
            $set: { sessionId: socket.id, displayName: socket.displayName || "" },
            $inc: { clicks: 1 },
        }
    );

    if (data.newPage === globalGame.targetPage) {
        await model.updateOne(
            gameFilterForUser(socket.userId),
            { $set: { completed: true } }
        );
    }

    await broadcastScoreboard(io, model);
    io.emit("game:clicked");

    if (typeof callback === "function") {
        callback({ success: true });
    }
}

async function handlePlayerFinished(io, socket, callback, model = GameSession) {
    if (!hasActiveGame()) {
        if (typeof callback === "function") {
            callback({ success: false, error: "No active game" });
        }
        return;
    }

    await ensurePlayerSession(model, {
        userId: socket.userId,
        displayName: socket.displayName,
        sessionId: socket.id,
    });

    await model.updateOne(
        gameFilterForUser(socket.userId),
        {
            $set: {
                sessionId: socket.id,
                displayName: socket.displayName || "",
                completed: true,
            },
        }
    );

    await broadcastScoreboard(io, model);
    io.emit("game:player-finished", { userId: socket.userId });

    if (typeof callback === "function") {
        callback({ success: true });
    }
}

function registerGameHandlers(io, socket, model = GameSession) {
    socket.on("game:start", (data, callback) => handleGameStart(io, data, callback, model));
    socket.on("game:click", (data, callback) => handleGameClick(io, socket, data, callback, model));
    socket.on("game:player-finished", (_data, callback) => handlePlayerFinished(io, socket, callback, model));
}

module.exports = registerGameHandlers;
