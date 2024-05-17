const mongoose = require('mongoose');

const FileChunkSchema = new mongoose.Schema({
    file_id: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'file',
        required: true,
    },
    chunk_id: {
        type: Number, 
        required: true, 
    },
    rows: {
        type: String, 
        required: true,
    },
    end_timestamp: {
        type: Number, 
        required: true,
    },
    start_timestamp: {
        type: Number, 
        required: true,
    },
    createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('file_chunk', FileChunkSchema);