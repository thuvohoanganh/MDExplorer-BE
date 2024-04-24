const mongoose = require("mongoose");

const BetweenDistributionSchema = new mongoose.Schema({
  data_type: { type: String },
});

module.exports = mongoose.model("BetweenDistribution", BetweenDistributionSchema);
