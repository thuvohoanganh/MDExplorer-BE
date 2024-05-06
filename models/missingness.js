const mongoose = require("mongoose");

const missingness = new mongoose.Schema({
  data_type: { 
    type: String,
    required: true,
 },
  data: { 
    type: String,
    required: true,
 },
  dataset_name: {
    type: String,
    required: true,
  },
  subject_id: {
    type: Number,
    required: true 
  },
});

module.exports = mongoose.model("missingness", missingness);
