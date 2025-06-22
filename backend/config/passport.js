const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const User = require("../models/User");

const initializePassport = (passport) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("Missing JWT_SECRET environment variable");
  }

  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  };

  passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
      try {
        const user = await User.findById(jwt_payload.id);
        if (user) {
          return done(null, user);
        }
        return done(null, false, { message: "User not found" });
      } catch (err) {
        console.error("JWT Strategy Error:", err);
        return done(err, false);
      }
    })
  );

  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
      },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email });
          if (!user) {
            return done(null, false, {
              message: "Incorrect email or password",
            });
          }
          const isMatch = await user.validatePassword(password);
          if (!isMatch) {
            return done(null, false, {
              message: "Incorrect email or password",
            });
          }
          return done(null, user);
        } catch (err) {
          console.error("Local Strategy Error:", err);
          return done(err);
        }
      }
    )
  );

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // First, try to find existing user by googleId
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            return done(null, user);
          }

          // If no user found by googleId, check by email to link accounts
          const email =
            profile.emails && profile.emails[0]
              ? profile.emails[0].value
              : null;
          if (email) {
            user = await User.findOne({ email: email });
            if (user) {
              // Link Google account to existing user
              user.googleId = profile.id;
              user.provider = user.provider || "google"; // Keep original provider if exists
              await user.save();
              return done(null, user);
            }
          }

          // Create new user with all required fields
          user = new User({
            googleId: profile.id,
            username:
              profile.displayName || profile.emails[0].value.split("@")[0], // Fallback username
            displayName:
              profile.displayName || profile.name?.givenName || "Google User", // Required field
            email: email || `${profile.id}@google.oauth`, // Fallback email if not provided
            provider: "google",
            // Don't set password for OAuth users - make sure your User model allows this
            profileImage:
              profile.photos && profile.photos[0]
                ? {
                    url: profile.photos[0].value,
                    public_id: "", // Cloudinary not used for OAuth profile images
                  }
                : undefined,
          });

          await user.save();
          return done(null, user);
        } catch (err) {
          console.error("Google Strategy Error:", err);
          return done(err);
        }
      }
    )
  );

  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL}/api/auth/github/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // First try to find by githubId
          let user = await User.findOne({ githubId: profile.id });

          if (user) {
            return done(null, user);
          }

          // If no user found by githubId, check by email to link accounts
          const email =
            profile.emails && profile.emails[0]
              ? profile.emails[0].value
              : `${profile.username}@github.com`;
          user = await User.findOne({ email: email });

          if (user) {
            // Link GitHub account to existing user
            user.githubId = profile.id;
            user.provider = user.provider || "github"; // Keep original provider if exists
            await user.save();
            return done(null, user);
          }

          // Create new user with all required fields
          user = new User({
            githubId: profile.id,
            username:
              profile.username || profile.displayName || email.split("@")[0],
            displayName:
              profile.displayName || profile.username || "GitHub User", // Required field
            email: email,
            provider: "github",
            // Don't set password for OAuth users
            profileImage:
              profile.photos && profile.photos[0]
                ? {
                    url: profile.photos[0].value,
                    public_id: "", // Cloudinary not used for OAuth profile images
                  }
                : undefined,
          });

          await user.save();
          return done(null, user);
        } catch (err) {
          console.error("GitHub Strategy Error:", err);
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      console.error("Deserialize Error:", err);
      done(err);
    }
  });
};

const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("Missing JWT_SECRET environment variable");
  }
  return require("jsonwebtoken").sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

module.exports = { initializePassport, generateToken };
