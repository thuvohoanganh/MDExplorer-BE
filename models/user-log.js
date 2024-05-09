const mongoose = require("mongoose");

const UserLogSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    information: {
        type: String,
    },
    logs: {
        type: String,
        required: true,
    },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("user_log", UserLogSchema);
