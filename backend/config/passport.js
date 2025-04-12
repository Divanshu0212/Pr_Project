const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config()

// JWT options
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

const initializePassport = (passport) => {

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Local strategy
  passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          return done(null, false, { message: 'No user with that email' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: 'Password incorrect' });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  ));

  // JWT strategy
  passport.use(new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
    try {
      const user = await User.findById(jwtPayload.id);
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (err) {
      return done(err, false);
    }
  }));

  // Google OAuth strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_DOMAIN}/api/auth/google/callback`,
    passReqToCallback: true
  },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const password = await bcrypt.hash(Math.random().toString(36).slice(-8), 10)

        // Try to find user by Google ID or email
        let user = await User.findOne({
          $or: [
            { googleId: profile.id },
            { email: email }
          ]
        });

        if (!user) {
          // Create new user if not found
          user = new User({
            googleId: profile.id,
            email: email,
            username: profile.displayName || email.split('@')[0],
            password: password,
            isVerified: true,
            provider: 'google',
            avatar: profile.photos[0]?.value
          });
          await user.save();
        } else if (!user.googleId) {
          // Link existing account with Google
          const originalUser = await User.findById(user._id);
          const originalPassword = originalUser.password;

          user.googleId = profile.id;
          user.provider = 'google';
          user.password = originalPassword; // Preserve the original password
          await user.save();
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }));

  // GitHub OAuth strategy
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: `http://localhost:5000/api/auth/github/callback`,
    passReqToCallback: true
  },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // First try to find by githubId
        let user = await User.findOne({ githubId: profile.id });

        if (user) {
          return done(null, user);
        }

        // If not found by githubId, check if email exists
        const email = profile.emails ? profile.emails[0].value : `${profile.username}@github.com`;
        user = await User.findOne({ email });

        if (user) {
          // If user exists but doesn't have githubId, add it to their account
          if (!user.githubId) {
            user.githubId = profile.id;
            user.provider = 'github';
            await user.save();
          }
          return done(null, user);
        }

        // If no user exists with this email or githubId, create new user
        user = new User({
          githubId: profile.id,
          email: email,
          username: profile.username,
          password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10), // Random password
          isVerified: true,
          provider: 'github'
        });

        await user.save();
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }));

  // Serialize user

};

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

module.exports = { initializePassport, generateToken };