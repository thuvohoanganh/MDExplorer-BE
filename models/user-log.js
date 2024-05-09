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
});

module.exports = mongoose.model("user_log", UserLogSchema);
