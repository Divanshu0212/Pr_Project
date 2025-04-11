const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');

// Get current user details
router.get('/user-details', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      provider: req.user.provider
    }
  });
});

// Logout
router.get('/userLogout', (req, res) => {
  req.logout();
  res.clearCookie('connect.sid');
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;