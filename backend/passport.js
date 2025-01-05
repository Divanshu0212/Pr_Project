const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GithubStrategy = require("passport-github2").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const passport = require("passport");

const GOOGLE_CLIENT_ID =
  "549555193866-59v64l5o0tedtp2cje5at1d1iike0ffj.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";

GITHUB_CLIENT_ID = "Ov23lipA6GQlMnEDONVx";
GITHUB_CLIENT_SECRET = "9d3a57182f0ab290b7065e624a6fcba59d3057fe";


passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
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
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
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
