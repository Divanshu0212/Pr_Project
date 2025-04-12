const express = require('express');
const router = express.Router();
const passport = require('passport');
const { generateToken } = require('../config/passport');
const User = require('../models/User');

// Local signup
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      provider: 'local'
    });

    await user.save();

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      message: 'Server error during signup'
    });
  }
});

// Local login
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


// In routes/auth.js
router.get('/verify-token', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({
    success: true,
    user: {
      _id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      avatar: req.user.avatar
    }
  });
});


// Google OAuth routes
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false
}));

router.get('/google/callback', 
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: false
  }),
  (req, res) => {
    // Successful authentication
    const token = generateToken(req.user);
    
    // Set the token in a secure, HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });
    
    // Redirect to frontend with user data in the URL (temporarily)
    res.redirect(`${process.env.CLIENT_URL}/oauth-callback?token=${token}&userId=${req.user._id}`);
  }
);

// routes/auth.js
router.get('/check', (req, res) => {
  if (req.isAuthenticated()) { // If using sessions
    return res.json({
      id: req.user._id,
      displayName: req.user.username,
      email: req.user.email,
      photos: req.user.avatar ? [{ value: req.user.avatar }] : []
    });
  }
  res.status(401).json({ error: 'Not authenticated' });
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
  // Generate token
  const token = generateToken(req.user);
  console.log(token)

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  });
  
  
  // Redirect to frontend with token
  res.redirect(`http://localhost:5173/oauth-callback?token=${token}&userId=${req.user._id}`);
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
router.get('/me', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({
    username: req.user.username,
    name: req.user.displayName,
    email: req.user.email,
  });
});

module.exports = router;