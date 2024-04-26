const mongoose = require("mongoose");

const BetweenDistributionSchema = new mongoose.Schema({
  data_type: { type: String },
  data: { type: String },
});

module.exports = mongoose.model("between_distribution", BetweenDistributionSchema);
