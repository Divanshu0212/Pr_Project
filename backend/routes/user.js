const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');
const profileImageController = require('../controller/profileImageController')

const userAuth = passport.authenticate('jwt', { session: false });

// Get current user details
router.get('/user-details', userAuth, (req, res) => {
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

// In routes/user.js, add a new route for updating user profile:
router.put(
  '/profile',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const updates = {};
      if (req.body.username) updates.username = req.body.username;
      if (req.body.email) updates.email = req.body.email;
      if (req.body.profileImage) updates.profileImage = req.body.profileImage;

      const user = await User.findByIdAndUpdate(
        req.user._id,
        updates,
        { new: true }
      ).select('-password');
      
      res.json({
        success: true,
        data: user
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Server Error'
      });
    }
  }
);

router.post('/profile-image', 
  passport.authenticate('jwt', { session: false }),
  profileImageController.uploadProfileImage
);
router.delete('/profile-image', userAuth, profileImageController.deleteProfileImage);


module.exports = router;