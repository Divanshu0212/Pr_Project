// backend/models/Resume.js
const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../utils/encryption');

const ResumeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to your User model
        required: true,
        index: true // Index for fast lookup by user
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    // We'll store the full JSON structure. PII fields within this JSON
    // will be handled by custom setters/getters.
    // The resume content is stored as a String after JSON.stringify
    // and potentially encrypted at a higher level if the whole content is sensitive.
    // For field-level encryption, we'll use virtuals/setters.
    resumeData: {
        type: String, // Store as string, parse/stringify in controller/middleware
        required: true
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['draft', 'final', 'archived'],
        default: 'draft'
    },
    previewUrl: { // URL to a static PDF preview if generated and stored externally
        type: String,
        trim: true
    },
    cloudinaryResumes: {
        public_id: String,
        url: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }
}, {
    timestamps: true, // Adds createdAt and updatedAt automatically
    toJSON: { virtuals: true }, // Ensure virtuals are included when converting to JSON
    toObject: { virtuals: true } // Ensure virtuals are included when converting to object
});

// --- PII Handling with Virtuals/Setters for Encryption/Decryption ---
// This approach involves intercepting data when it's set/read from the Mongoose document.
// It assumes that 'name', 'email', 'phone' are top-level fields within the `resumeData` JSON string.
// If your resumeData structure is deeply nested and requires encryption,
// you might need to encrypt/decrypt the entire `resumeData` string, or
// have a more sophisticated pre-save/post-find hook.

// Example: Encrypt/Decrypt 'email' field *within* resumeData.
// This is an example for a top-level field that might be explicitly extracted.
// For deeply nested JSON, the encryption/decryption logic might need to be
// applied to the entire `resumeData` string on save/find.

// Virtual for 'name'
ResumeSchema.virtual('decryptedResumeData').get(function() {
    try {
        const parsedData = JSON.parse(this.resumeData);
        // Decrypt specific PII fields if they exist
        if (parsedData.name) parsedData.name = decrypt(parsedData.name);
        if (parsedData.email) parsedData.email = decrypt(parsedData.email);
        if (parsedData.phone) parsedData.phone = decrypt(parsedData.phone);
        // ... add other PII fields
        return parsedData;
    } catch (e) {
        console.error('Error parsing or decrypting resumeData:', e.message);
        return null;
    }
});

// Pre-save hook to encrypt PII within resumeData before saving
ResumeSchema.pre('save', function (next) {
    if (this.isModified('resumeData') || this.isNew) {
        try {
            const parsedData = JSON.parse(this.resumeData);
            // Encrypt specific PII fields if they exist
            if (parsedData.name) parsedData.name = encrypt(parsedData.name);
            if (parsedData.email) parsedData.email = encrypt(parsedData.email);
            if (parsedData.phone) parsedData.phone = encrypt(parsedData.phone);
            // ... add other PII fields
            this.resumeData = JSON.stringify(parsedData);
        } catch (e) {
            console.error('Error parsing or encrypting resumeData on save:', e.message);
            return next(new Error('Failed to process resume data securely.'));
        }
    }
    next();
});

// Post-find hook to decrypt PII after retrieval (if needed for direct modification)
// For `find` operations that return a document instance.
// Note: Virtual `decryptedResumeData` is generally preferred for reading.
// This hook modifies the actual `resumeData` field *after* it's retrieved from DB,
// so subsequent operations on the document instance work with decrypted data.
ResumeSchema.post('find', function(docs) {
    if (docs && docs.length > 0) {
        docs.forEach(doc => {
            if (doc.resumeData) {
                try {
                    let parsedData = JSON.parse(doc.resumeData);
                    if (parsedData.name) parsedData.name = decrypt(parsedData.name);
                    if (parsedData.email) parsedData.email = decrypt(parsedData.email);
                    if (parsedData.phone) parsedData.phone = decrypt(parsedData.phone);
                    doc.resumeData = JSON.stringify(parsedData); // Update the document's field
                } catch (e) {
                    console.error('Error parsing or decrypting resumeData on find hook:', e.message);
                    // Decide if you want to throw or just log and proceed
                }
            }
        });
    }
});

ResumeSchema.post('findOne', function(doc) {
    if (doc && doc.resumeData) {
        try {
            let parsedData = JSON.parse(doc.resumeData);
            if (parsedData.name) parsedData.name = decrypt(parsedData.name);
            if (parsedData.email) parsedData.email = decrypt(parsedData.email);
            if (parsedData.phone) parsedData.phone = decrypt(parsedData.phone);
            doc.resumeData = JSON.stringify(parsedData);
        } catch (e) {
            console.error('Error parsing or decrypting resumeData on findOne hook:', e.message);
        }
    }
});


module.exports = mongoose.model('Resume', ResumeSchema);