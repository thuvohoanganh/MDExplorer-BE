const mongoose = require("mongoose");

const BetweenDistributionSchema = new mongoose.Schema({
  data_type: { type: String },
  data: { type: String },
  dataset_name: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("between_distribution", BetweenDistributionSchema);
