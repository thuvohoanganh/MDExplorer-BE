const mongoose = require("mongoose");

const FactorSchema = new mongoose.Schema({
  title: { type: String },
  code: { type: String },
  icon_source: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("factor", FactorSchema);
