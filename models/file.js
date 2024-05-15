const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
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
    chunk_qty: {
        type: Number,
        required: true
    },
    sample_size: {
        type: Number,
        required: true
    },
    category: {
        type: String, 
    },
    createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('file', FileSchema);