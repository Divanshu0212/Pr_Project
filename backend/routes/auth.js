const express = require('express');
const router = express.Router();
const passport = require('passport');
const { generateToken } = require('../config/passport');
const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');
const upload = require('../middleware/upload');
const multer = require('multer');

const errorResponse = (res, status, message) => {
  return res.status(status).json({
    success: false,
    message
  });
};

// Local signup
router.post('/signup', (req, res, next) => {
  upload.single('profileImage')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer Error:', err);
      return res.status(400).json({
        success: false,
        message: 'File upload error: ' + err.message
      });
    } else if (err) {
      console.error('Upload Error:', err);
      return res.status(400).json({
        success: false,
        message: 'File upload error: ' + err.message
      });
    }

    try {
      const { username, email, password, displayName } = req.body;

      // Validate required fields
      if (!username || !email || !password || !displayName) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required',
          missingFields: {
            username: !username,
            email: !email,
            password: !password,
            displayName: !displayName
          }
        });
      }

      // Validate email format
      if (!/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }

      // Check for existing user
      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        return res.status(400).json({ 
          success: false,
          message: 'User already exists',
          conflict: {
            email: existingUser.email === email,
            username: existingUser.username === username
          }
        });
      }

      // Create user
      const user = new User({ username, email, password, displayName });

      // Handle profile image if provided
      let profileImage = { public_id: '', url: '' };
      if (req.file) {
        const publicId = req.file.public_id || req.file.filename;
        const secureUrl = req.file.secure_url || req.file.path;
        profileImage = {
          public_id: publicId,
          url: secureUrl
        };
        user.profileImage = profileImage;
      } else {
        console.log('No profile image uploaded');
      }

      // Save user with profile image
      await user.save();

      // Generate token
      const token = generateToken(user);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          id: user._id,
          username: user.username,
          displayName: user.displayName,
          email: user.email,
          profileImage: user.profileImage
        }
      });

    } catch (err) {
      console.error('Signup error:', err);
      
      // Rollback: Delete from Cloudinary if upload occurred but save failed
      if (req.file?.public_id || req.file?.filename) {
        await cloudinary.uploader.destroy(req.file.public_id || req.file.filename);
      }

      // Handle Mongoose validation errors
      if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Server error during signup'
      });
    }
  });
});

// Local login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Server error during authentication'
      });
    }
    if (!user) {
      return res.status(401).json({
        success: false,
        message: info.message || 'Authentication failed'
      });
    }

    req.login(user, (err) => {
      if (err) {
        return next(err);
      }

      const token = generateToken(user);

      return res.json({
        success: true,
        message: 'Logged in successfully',
        data: {
          token,
          user: {
            id: user._id,
            username: user.username,
            displayName: user.displayName,
            email: user.email,
            provider: user.provider,
            profileImage: user.profileImage
          }
        }
      });
    });
  })(req, res, next);
});

// Session check endpoint
router.get('/check-session', (req, res) => {
  if (req.isAuthenticated()) {
    return res.json({
      success: true,
      user: {
        id: req.user._id,
        username: req.user.username,
        displayName: req.user.displayName,
        email: req.user.email,
        provider: req.user.provider,
        profileImage: req.user.profileImage
      }
    });
  }
  errorResponse(res, 401, 'Not authenticated');
});

// In routes/auth.js
router.get('/verify-token', passport.authenticate('jwt', { session: false }), (req, res) => {
  if (!req.user) {
    return errorResponse(res, 401, 'Invalid or expired token');
  }
  res.json({
    success: true,
    user: {
      id: req.user._id,
      username: req.user.username,
      displayName: req.user.displayName,
      email: req.user.email,
      profileImage: req.user.profileImage
    }
  });
});


// Google OAuth routes
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false
}));

router.get('/google/callback', passport.authenticate('google', {
  failureRedirect: `${process.env.FRONTEND_URL}/login?error=google-auth-failed`,
  session: false
}), (req, res) => {
  const token = generateToken(req.user);
  res.redirect(`${process.env.FRONTEND_URL}/oauth-callback?token=${token}&provider=google`);
});

// GitHub OAuth routes
router.get('/github', passport.authenticate('github', {
  scope: ['user:email'],
  session: false
}));

router.get('/github/callback', passport.authenticate('github', {
  failureRedirect: `${process.env.FRONTEND_URL}/login?error=github-auth-failed`,
  session: false
}), (req, res) => {
  const token = generateToken(req.user);
  res.redirect(`${process.env.FRONTEND_URL}/oauth-callback?token=${token}&provider=github`);
});

// Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ success: false, message: 'Logout failed' });
    }
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
        return res.status(500).json({ success: false, message: 'Session destruction failed' });
      }

      res.clearCookie('connect.sid');
      res.json({ success: true, message: 'Logged out successfully' });
    });
  });
});

router.get('/me', passport.authenticate('jwt', { session: false }), (req, res) => {
  if (!req.user) {
    return errorResponse(res, 401, 'Not authenticated');
  }
  res.json({
    success: true,
    user: {
      username: req.user.username,
      email: req.user.email,
      displayName: req.user.displayName,
      id: req.user._id,
      profileImage: req.user.profileImage
    }
  });
});

module.exports = router;