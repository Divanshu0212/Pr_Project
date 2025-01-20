require('dotenv').config();
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GithubStrategy = require("passport-github2").Strategy;
const passport = require("passport");


passport.use(
  new GoogleStrategy(
    {
      clientID: "549555193866-59v64l5o0tedtp2cje5at1d1iike0ffj.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "/auth/google/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      done(null, profile);
    }
  )
);

passport.use(
  new GithubStrategy(
    {
      clientID: "Ov23lipA6GQlMnEDONVx",
      clientSecret: "9d3a57182f0ab290b7065e624a6fcba59d3057fe",
      callbackURL: "/auth/github/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      done(null, profile);
    }
  )
);
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
