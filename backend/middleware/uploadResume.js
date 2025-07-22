// backend/middleware/uploadResume.js
const multer = require('multer');
const path = require('path');

// --- Multer Storage Configuration (Option A: In-memory for temporary processing) ---
const storage = multer.memoryStorage(); // Store the file in memory as a Buffer

// --- File Filter for Type Validation ---
const fileFilter = (req, file, cb) => {
    // Allowed file extensions and MIME types
    const allowedMimeTypes = [
        'application/pdf',
        'application/msword', // .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
    ];

    // Check if the uploaded file's MIME type is in our allowed list
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true); // Accept the file
    } else {
        // Reject the file and provide an error message
        cb(new Error('Invalid file type. Only PDF and DOCX files are allowed.'), false);
    }
};

// --- Multer Upload Configuration ---
const uploadResume = multer({
    storage: storage, // Use in-memory storage
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB file size limit (adjust as needed)
    },
    fileFilter: fileFilter // Apply the file type validation
});

module.exports = uploadResume;