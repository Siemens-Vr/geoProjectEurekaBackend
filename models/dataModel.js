const mongoose = require('mongoose');
const Counter = require('./counterModel');

const dataSchema = new mongoose.Schema({
    dataId: { type: Number, unique: true },
    title: { type: String, required: true },
    imagesVideos: [{ type: String }],
    location: { type: String },
    sampleType: { type: String },
    collectionDate: { type: Date },
    depth: { type: Number },
    temperature: { type: Number },
    pH: { type: Number },
    electricalConductivity: { type: Number },
    geochemistryComment: { type: String },
    lithology: { type: String },
    alteration: { type: String },
    mineralogy: { type: String },
    geochimicalAnalysis: { type: String },
    texture: { type: String },
    hydrothermalFeatures: { type: String },
    structure: { type: String },
    geologyComment: { type: String },
    method: { type: String },
    surveyDate: { type: Date },
    depthOfPenetrationMeters: { type: Number },
    resolutionsMeters: { type: Number },
    measuredParameters: { type: String },
    recoveredPropertiesOfInterest: { type: String },
    instrumentUsed: { type: String },
    potentialTargets: { type: String },
    geophysicsComment: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    author: { type: String, requires: true }
});

// Middleware pour l'auto-incrément
dataSchema.pre('save', async function (next) {
    const doc = this;

    if (!doc.isNew) return next(); // Si ce n'est pas un nouveau document, ne rien faire

    try {
        // Trouver et incrémenter le compteur pour la collection Data
        const counter = await Counter.findByIdAndUpdate(
            { _id: 'dataId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true } // Si le document n'existe pas, il est créé
        );

        doc.dataId = counter.seq; // Assigner la valeur incrémentée à dataId
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('Data', dataSchema);
