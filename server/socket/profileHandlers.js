const UserProfile = require("../models/UserProfile");

async function hasBeenAsked(userId, model = UserProfile) {
    const existing = await model.findOne({ userId }).lean();
    return Boolean(existing);
}

async function handleSubmitPhone(socket, data, callback, model = UserProfile) {
    try {
        await model.findOneAndUpdate(
            { userId: socket.userId },
            {
                $set: {
                    userId: socket.userId,
                    displayName: socket.displayName || "",
                    phoneNumber: data?.phoneNumber || null,
                },
            },
            { upsert: true }
        );
        if (typeof callback === "function") {
            callback({ success: true });
        }
    } catch (err) {
        console.error("Failed to save phone number:", err.message);
        if (typeof callback === "function") {
            callback({ success: false, error: err.message });
        }
    }
}

function registerProfileHandlers(io, socket, model = UserProfile) {
    socket.on("profile:submit-phone", (data, callback) => handleSubmitPhone(socket, data, callback, model));
}

module.exports = registerProfileHandlers;
module.exports.hasBeenAsked = hasBeenAsked;
