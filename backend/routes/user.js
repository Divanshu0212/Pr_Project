const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');
const upload = require('../middleware/upload');

// Get user details
router.get('/user-details', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update profile image
router.post('/profile-image', passport.authenticate('jwt', { session: false }), (req, res, next) => {
  upload.single('profileImage')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer Error:', err);
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      console.error('Upload Error:', err);
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Delete old image from Cloudinary if it exists
      if (user.profileImage.public_id) {
        await cloudinary.uploader.destroy(user.profileImage.public_id);
      }

      // Update user with new image
      user.profileImage = {
        public_id: req.file.public_id || req.file.filename,
        url: req.file.secure_url || req.file.path
      };
      await user.save();

      res.json({
        success: true,
        message: 'Profile image updated successfully',
        profileImage: user.profileImage
      });
    } catch (error) {
      console.error('Error updating profile image:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
});

// Delete profile image
router.delete('/profile-image', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.profileImage.public_id) {
      await cloudinary.uploader.destroy(user.profileImage.public_id);
    }

    user.profileImage = { public_id: '', url: '' };
    await user.save();

    res.json({ success: true, message: 'Profile image deleted successfully' });
  } catch (error) {
    console.error('Error deleting profile image:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;