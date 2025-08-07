const express = require('express');
const router = express.Router();
const candidateController = require('../controller/candidateController');
const auth = require('../middleware/auth');

// @route   GET /api/candidates/search
// @desc    Search for candidates with advanced filtering
// @access  Private (for companies/recruiters)
router.get('/search', auth, candidateController.searchCandidates);

// @route   GET /api/candidates/stats
// @desc    Get candidate statistics for dashboard
// @access  Private
router.get('/stats', auth, candidateController.getCandidateStats);

// @route   GET /api/candidates/:candidateId
// @desc    Get detailed candidate profile
// @access  Private
router.get('/:candidateId', auth, candidateController.getCandidateProfile);

module.exports = router;
