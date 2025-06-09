const express = require('express');
const router = express.Router();
const projectController = require('../controller/projectController');
const upload = require('../middleware/uploadProject');
const passport = require('passport');

// Project routes
router.post('/', passport.authenticate('jwt', { session: false }), upload.single('image'), projectController.addProject);
router.get('/', passport.authenticate('jwt', { session: false }), projectController.getProjects);
router.get('/counts', passport.authenticate('jwt', { session: false }), projectController.getProjectCounts);
router.get('/:id', passport.authenticate('jwt', { session: false }), projectController.getProject);
router.put('/:id', passport.authenticate('jwt', { session: false }), upload.single('image'), projectController.updateProject);
router.delete('/:id', passport.authenticate('jwt', { session: false }), projectController.deleteProject);

module.exports = router;