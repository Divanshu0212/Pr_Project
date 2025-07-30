// backend/routes/ats.js
const express = require('express');
const router = express.Router();
const atsController = require('../controller/atsController');
const auth = require('../middleware/auth'); // Authentication middleware
const uploadResume = require('../middleware/uploadResume'); // Import the Multer middleware for resume uploads

// @route   POST /api/ats/analyze
// @desc    Upload a resume file and job description for ATS analysis
// @access  Private
// This route uses 'auth' middleware for authentication,
// and 'uploadResume.single('resumeFile')' to handle the file upload.
// 'resumeFile' is the name of the field in the form data that contains the file.
router.post('/analyze', auth, uploadResume, atsController.analyzeResume);

// @route   GET /api/ats/history
// @desc    Get a summary list of all ATS analyses for the authenticated user
// @access  Private
router.get('/history', auth, atsController.getAtsHistory);

// @route   GET /api/ats/analysis/:analysisId
// @desc    Get a specific ATS analysis report by its unique ID
// @access  Private
router.get('/analysis/:analysisId', auth, atsController.getAtsAnalysisById);

// @route   DELETE /api/ats/analysis/:analysisId
// @desc    Delete a specific ATS analysis report by its unique ID
// @access  Private
router.delete('/analysis/:analysisId', auth, atsController.deleteAtsAnalysis);

// @route   POST /api/ats/keywords
// @desc    Extract keywords from provided text (e.g., job description) without retaining PII
// @access  Private (though could be public if entirely stateless and non-sensitive)
// Changed to POST to receive text in body, GET with query params is less ideal for larger texts
router.post('/keywords', auth, atsController.getKeywords);

module.exports = router;