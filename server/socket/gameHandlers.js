const GameSession = require("../models/GameSession");
const APP_TIMEZONE = require("../config/timezone");

const BROADCAST_INTERVAL_MS = 1000;
const TOTAL_CHALLENGES = 3;
let broadcastTimer = null;

const dateKeyFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
});

function getDateKey() {
    return dateKeyFormatter.format(new Date());
}

function gameFilterForUser(userId, game) {
    return {
        userId,
        dateKey: game.dateKey,
        start: game.startPage,
        target: game.targetPage,
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

async function getLeaderboard(model = GameSession) {
    return model.aggregate([
        { $match: { dateKey: getDateKey(), completed: true } },
        {
            $group: {
                _id: "$userId",
                displayName: { $last: "$displayName" },
                totalClicks: { $sum: "$clicks" },
                totalElapsedSeconds: { $sum: { $ifNull: ["$elapsedSeconds", 0] } },
                completedCount: { $sum: 1 },
            },
        },
        { $match: { completedCount: TOTAL_CHALLENGES } },
        { $sort: { totalClicks: 1, totalElapsedSeconds: 1 } },
        {
            $project: {
                userId: "$_id",
                displayName: 1,
                totalClicks: 1,
                totalElapsedSeconds: 1,
                completedCount: 1,
                _id: 0,
            },
        },
    ]);
}

async function broadcastScoreboard(io, model = GameSession) {
    const sessions = await getLeaderboard(model);
    io.emit("leaderboard:update", sessions);
}

function scheduleBroadcast(io, model = GameSession) {
    if (broadcastTimer) return;
    broadcastTimer = setTimeout(() => {
        broadcastTimer = null;
        broadcastScoreboard(io, model).catch((err) => {
            console.error("Leaderboard broadcast failed:", err.message);
        });
    }, BROADCAST_INTERVAL_MS);
}

async function getTodaysProgress(userId, model = GameSession) {
    const sessions = await model.find({ userId, dateKey: getDateKey() }).lean();
    return sessions.map((s) => ({
        start: s.start,
        target: s.target,
        completed: s.completed,
        clicks: s.clicks,
        elapsedSeconds: s.elapsedSeconds,
    }));
}

async function handleGameStart(io, socket, data, callback, model = GameSession) {
    const game = { startPage: data.startPage, targetPage: data.targetPage, dateKey: getDateKey() };

    const existing = await model.findOne(gameFilterForUser(socket.userId, game)).lean();
    if (existing?.completed) {
        if (typeof callback === "function") {
            callback({ success: false, error: "Challenge already completed today" });
        }
        return;
    }

    socket.activeGame = game;

    await model.updateOne(
        gameFilterForUser(socket.userId, game),
        {
            $set: {
                userId: socket.userId,
                displayName: socket.displayName || "",
                sessionId: socket.id,
                start: game.startPage,
                target: game.targetPage,
                dateKey: game.dateKey,
                clicks: 0,
                elapsedSeconds: null,
                quit: false,
                completed: false,
            },
        },
        { upsert: true }
    );

    socket.emit("game:started", { startPage: game.startPage, targetPage: game.targetPage });
    await broadcastScoreboard(io, model);

    if (typeof callback === "function") {
        callback({ success: true });
    }
}

async function handleGameClick(io, socket, data, callback, model = GameSession) {
    const game = socket.activeGame;
    if (!game) {
        if (typeof callback === "function") {
            callback({ success: false, error: "No active game" });
        }
        return;
    }

    await model.updateOne(
        gameFilterForUser(socket.userId, game),
        {
            $set: {
                userId: socket.userId,
                displayName: socket.displayName || "",
                sessionId: socket.id,
                start: game.startPage,
                target: game.targetPage,
                dateKey: game.dateKey,
            },
            $inc: { clicks: 1 },
        },
        { upsert: true }
    );

    if (data.newPage === game.targetPage) {
        await model.updateOne(
            gameFilterForUser(socket.userId, game),
            { $set: { completed: true } }
        );
    }

    scheduleBroadcast(io, model);
    io.emit("game:clicked");

    if (typeof callback === "function") {
        callback({ success: true });
    }
}

async function handlePlayerFinished(io, socket, data, callback, model = GameSession) {
    const game = socket.activeGame;
    if (!game) {
        if (typeof callback === "function") {
            callback({ success: false, error: "No active game" });
        }
        return;
    }

    const elapsedSeconds = typeof data?.elapsedSeconds === "number" ? data.elapsedSeconds : null;

    await model.updateOne(
        gameFilterForUser(socket.userId, game),
        {
            $set: {
                userId: socket.userId,
                displayName: socket.displayName || "",
                sessionId: socket.id,
                start: game.startPage,
                target: game.targetPage,
                dateKey: game.dateKey,
                completed: true,
                ...(elapsedSeconds !== null && { elapsedSeconds }),
            },
        },
        { upsert: true }
    );

    await broadcastScoreboard(io, model);
    io.emit("game:player-finished", { userId: socket.userId });

    if (typeof callback === "function") {
        callback({ success: true });
    }
}

function registerGameHandlers(io, socket, model = GameSession) {
    socket.on("game:start", (data, callback) => handleGameStart(io, socket, data, callback, model));
    socket.on("game:click", (data, callback) => handleGameClick(io, socket, data, callback, model));
    socket.on("game:player-finished", (data, callback) => handlePlayerFinished(io, socket, data, callback, model));
}

module.exports = registerGameHandlers;
module.exports.getTodaysProgress = getTodaysProgress;
module.exports.getDateKey = getDateKey;
module.exports.getLeaderboard = getLeaderboard;
