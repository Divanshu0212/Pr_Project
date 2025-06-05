const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

const initializePassport = (passport) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('Missing JWT_SECRET environment variable');
  }

  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
  };

  passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      console.log('JWT Payload:', jwt_payload);
      const user = await User.findById(jwt_payload.id);
      if (user) {
        return done(null, user);
      }
      return done(null, false, { message: 'User not found' });
    } catch (err) {
      console.error('JWT Strategy Error:', err);
      return done(err, false);
    }
  }));

  passport.use(new LocalStrategy({
    usernameField: 'email'
  }, async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return done(null, false, { message: 'Incorrect email or password' });
      }
      const isMatch = await user.validatePassword(password);
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect email or password' });
      }
      return done(null, user);
    } catch (err) {
      console.error('Local Strategy Error:', err);
      return done(err);
    }
  }));

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        user = new User({
          googleId: profile.id,
          username: profile.displayName,
          email: profile.emails[0].value,
          provider: 'google'
        });
        await user.save();
      }
      return done(null, user);
    } catch (err) {
      console.error('Google Strategy Error:', err);
      return done(err);
    }
  }));

  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL}/api/auth/github/callback`
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ githubId: profile.id });
      if (!user) {
        user = new User({
          githubId: profile.id,
          username: profile.username,
          email: profile.emails ? profile.emails[0].value : `${profile.username}@github.com`,
          provider: 'github'
        });
        await user.save();
      }
      return done(null, user);
    } catch (err) {
      console.error('GitHub Strategy Error:', err);
      return done(err);
    }
  }));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      console.error('Deserialize Error:', err);
      done(err);
    }
  });
};

const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('Missing JWT_SECRET environment variable');
  }
  return require('jsonwebtoken').sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

module.exports = { initializePassport, generateToken };