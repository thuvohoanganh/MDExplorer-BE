const mongoose = require("mongoose");

const VideoSchema = new mongoose.Schema({
  source: { type: String },
  name: { type: String },
  subject_id: { type: Number },
  dataset_name: {
    type: String,
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Video", VideoSchema);
