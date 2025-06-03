const express = require('express');
const router = express.Router();
const passport = require('passport');
const { generateToken } = require('../config/passport');
const User = require('../models/User');

const errorResponse = (res, status, message) => {
  return res.status(status).json({
    success: false,
    message
  });
};

// Local signup
router.post('/signup', async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
        missingFields: {
          username: !username,
          email: !email,
          password: !password
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

    // Create and save user
    const user = new User({ username, email, password });
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
        email: user.email,
        profileImage: user.profileImage
      }
    });

  } catch (err) {
    console.error('Signup error:', err);
    
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

// Local login

// routes/auth.js
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

    // This establishes the session
    req.login(user, (err) => {
      if (err) {
        return next(err);
      }

      // Generate token if you also want JWT
      const token = generateToken(user);

      return res.json({
        success: true,
        message: 'Logged in successfully',
        data: {
          token,
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            provider: user.provider
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
        email: req.user.email,
        provider: req.user.provider
      }
    });
  }
  errorResponse(res, 401, 'Not authenticated');
});

router.get('/verify-token', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email
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
  // Generate token
  const token = generateToken(req.user);

  // Redirect to frontend with token
  res.redirect(`${process.env.FRONTEND_URL}/oauth-callback?token=${token}&provider=google`);
});

// routes/auth.js
// router.get('/check', (req, res) => {
//   if (req.isAuthenticated()) { // If using sessions
//     return res.json({
//       id: req.user._id,
//       displayName: req.user.username,
//       email: req.user.email,
//       photos: req.user.avatar ? [{ value: req.user.avatar }] : []
//     });
//   }
//   res.status(401).json({ error: 'Not authenticated' });
// });

// GitHub OAuth routes
router.get('/github', passport.authenticate('github', {
  scope: ['user:email'],
  session: false
}));

router.get('/github/callback', passport.authenticate('github', {
  failureRedirect: `${process.env.FRONTEND_URL}/login?error=github-auth-failed`,
  session: false
}), (req, res) => {
  // Generate token
  const token = generateToken(req.user);

  // Redirect to frontend with token
  res.redirect(`${process.env.FRONTEND_URL}/oauth-callback?token=${token}&provider=github`);
});

// Logout
// routes/auth.js
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ success: false, message: 'Logout failed' });
    }

    // Clear the session cookie
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
        return res.status(500).json({ success: false, message: 'Session destruction failed' });
      }

      res.clearCookie('connect.sid'); // The default session cookie name
      res.json({ success: true, message: 'Logged out successfully' });
    });
  });
});

// routes/auth.js
router.get('/me',
  passport.authenticate(['jwt', 'session'], { session: false }),
  (req, res) => {
    res.json({
      success: true,
      user: {
        username: req.user.username,
        email: req.user.email,
        id: req.user._id,
        profileImage: req.user.profileImage
      }
    });
  }
);

module.exports = router;