const mongoose = require('mongoose');

const CsvSchema = new mongoose.Schema({
    data_type: {
        type: String, 
        required: true, 
    },
    subject_id: {
        type: Number,
        required: true 
    },
    columns: {
        type: Array, 
        required: true
    },
    rows: {
        type: String, 
        required: true
    },
    category: {
        type: String, 
        required: true,
        enum: ['sensor', 'label']
    },
    within_distribution: {
        type: String, 
    },
    missingness: {
        type: String, 
    },
    createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Csv', CsvSchema);