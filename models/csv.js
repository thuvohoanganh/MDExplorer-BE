const mongoose = require('mongoose');

const CsvSchema = new mongoose.Schema({
    dataset_name: {
        type: String,
        required: true,
    },
    data_type: {
        type: String, 
        required: true, 
    },
    subject_id: {
        type: Number,
        required: true 
    },
    columns: {
        type: String, 
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
    createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Csv', CsvSchema);