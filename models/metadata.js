const mongoose = require("mongoose");

const MetadataSchema = new mongoose.Schema({
  source: { type: String },
  data_type: { type: String },
  description: { type: String },
  device: { type: String },
  sampling_rate: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Metadata", MetadataSchema);
