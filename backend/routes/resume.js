// backend/routes/resume.js
const express = require('express');
const router = express.Router();
const resumeController = require('../controller/resumeController');
const auth = require('../middleware/auth'); // Assuming you have an authentication middleware

// @route   GET /api/resumes/default-resume
// @desc    Get a default/empty resume structure
// @access  Public (No Auth required for template creation)
// IMPORTANT: This static route MUST come BEFORE the dynamic /:id route.
router.get('/default-resume', resumeController.getDefaultResume);

// @route   POST /api/resumes
// @desc    Create a new resume
// @access  Private
router.post('/', auth, resumeController.createResume);

// @route   GET /api/resumes
// @desc    Get all resumes for the authenticated user
// @access  Private
router.get('/', auth, resumeController.getAllResumes);

// @route   GET /api/resumes/:id
// @desc    Get a single resume by ID for the authenticated user
// @access  Private
router.get('/:id', auth, resumeController.getResumeById);

// @route   PUT /api/resumes/:id
// @desc    Update a resume by ID for the authenticated user
// @access  Private
router.put('/:id', auth, resumeController.updateResume);

// @route   DELETE /api/resumes/:id
// @desc    Delete a resume by ID for the authenticated user
// @access  Private
router.delete('/:id', auth, resumeController.deleteResume);


module.exports = router;