const express = require('express');
const router = express.Router();
const experienceController = require('../controller/experienceController');
const upload = require('../middleware/uploadExperience');
const passport = require('passport');

router.route('/')
  .get(passport.authenticate('jwt', { session: false }), experienceController.getExperiences)
  .post(passport.authenticate('jwt', { session: false }), upload.single('companyLogo'), experienceController.addExperience);

router.route('/:id')
  .put(passport.authenticate('jwt', { session: false }), upload.single('companyLogo'), experienceController.updateExperience)
  .delete(passport.authenticate('jwt', { session: false }), experienceController.deleteExperience);

router.get('/total', passport.authenticate('jwt', { session: false }), experienceController.getTotalExperience);

module.exports = router;