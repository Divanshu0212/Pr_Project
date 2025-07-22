// backend/models/AtsAnalysis.js
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // For generating cryptographically strong IDs
// const { encrypt, decrypt } = require('../utils/encryption'); // Uncomment if you decide to encrypt reportData content

const AtsAnalysisSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Assuming a User model exists
        required: true,
        index: true // Index for efficient user-specific queries
    },
    analysisId: {
        type: String,
        required: true,
        unique: true,
        default: uuidv4, // Generates a unique ID for each analysis
        index: true // Ensure fast lookups by analysisId
    },
    resumeTitle: {
        type: String,
        required: true,
        maxlength: 255
    },
    jobTitle: {
        type: String,
        maxlength: 255,
        default: 'N/A' // Default if no job title is provided
    },
    analysisDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    // Summary data for history view (e.g., for /api/ats/history)
    summary: {
        matchScore: { type: Number, min: 0, max: 100 },
        keywordCount: { type: Number, min: 0 },
        // Add other summary fields as needed for the dashboard view
    },
    // Detailed analysis report (JSON string or Object)
    // IMPORTANT: Ensure this doesn't contain PII from the original resume/job description.
    // If it *must* contain such data, apply encryption.
    reportData: {
        type: String, // Storing as string to handle potentially complex JSON and for easier encryption if needed
        required: true,
        // If encrypting: set: (val) => encrypt(val), get: (val) => decrypt(val)
    },
    // For data retention policy
    expiresAt: {
        type: Date,
        // Set an expiry date, e.g., 60 days from creation
        default: () => new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        index: { expires: '0s' } // MongoDB TTL index to automatically delete documents after this time
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Optional: If reportData needs encryption/decryption, use mongoose getters/setters or pre/post hooks
// Example if encrypting reportData:
/*
AtsAnalysisSchema.path('reportData').get(function(v) {
    try {
        return JSON.parse(decrypt(v));
    } catch (e) {
        console.error("Error decrypting reportData:", e);
        return {}; // Or throw error, depending on desired behavior
    }
});

AtsAnalysisSchema.path('reportData').set(function(v) {
    try {
        return encrypt(JSON.stringify(v));
    } catch (e) {
        console.error("Error encrypting reportData:", e);
        return ''; // Or throw error
    }
});
*/

module.exports = mongoose.model('AtsAnalysis', AtsAnalysisSchema);