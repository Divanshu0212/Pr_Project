// backend/routes/resume.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const resumeController = require('../controller/resumeController');
const uploadResume = require('../middleware/uploadResume');

// Debugging logs to verify imports
// console.log('resumeController type:', typeof resumeController.createResume);
// console.log('uploadResume type:', typeof uploadResume.single);
// console.log('resumeController:', resumeController);
// console.log('Does createResume exist?', 'createResume' in resumeController);

// Public route - no authentication needed
router.get('/default-resume', resumeController.getDefaultResume);

// Protected routes - require JWT authentication
router.post(
    '/',
    passport.authenticate('jwt', { session: false }),
    uploadResume,
    resumeController.createResume
);

router.get(
    '/',
    passport.authenticate('jwt', { session: false }),
    resumeController.getAllResumes
);

router.get(
    '/:id',
    passport.authenticate('jwt', { session: false }),
    resumeController.getResumeById
);

router.put(
    '/:id',
    passport.authenticate('jwt', { session: false }),
    uploadResume,
    resumeController.updateResume
);

router.delete(
    '/:id',
    passport.authenticate('jwt', { session: false }),
    resumeController.deleteResume
);

router.post(
    '/upload',
    passport.authenticate('jwt', { session: false }),
    uploadResume,
    resumeController.uploadResumeToCloudinary
);

router.get(
    '/cloudinary',
    passport.authenticate('jwt', { session: false }),
    resumeController.listCloudinaryResumes
);

router.delete(
    '/cloudinary/:resumeId',
    passport.authenticate('jwt', { session: false }),
    resumeController.deleteCloudinaryResume
);

module.exports = router;