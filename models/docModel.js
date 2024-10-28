const mongoose = require('mongoose');

const DocSchema = new mongoose.Schema({
    title: { type: String, required: true },         // Corrected field name
    author: { type: String, required: true },        // Lowercase for consistency
    uploadDate: { type: Date, required: true },      // Changed to Date type
    files: { type: [String], required: true },       // Array to store file URLs
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }  // Reference to User
});

module.exports = mongoose.model('Document', DocSchema);
