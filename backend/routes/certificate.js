const express = require('express');
const router = express.Router();
const certificateController = require('../controller/certificateController');
const upload = require('../middleware/uploadCertificate');
const passport = require('passport');

router.route('/')
    .get(passport.authenticate('jwt', { session: false }), certificateController.getCertificates)
    .post(passport.authenticate('jwt', { session: false }), upload.single('image'), certificateController.addCertificate);

router.route('/:id')
    .put(passport.authenticate('jwt', { session: false }), upload.single('image'), certificateController.updateCertificate)
    .delete(passport.authenticate('jwt', { session: false }), certificateController.deleteCertificate);

router.route('/count')
    .get(passport.authenticate('jwt', { session: false }), certificateController.getCertificateCount);

module.exports = router;