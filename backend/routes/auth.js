const router = require("express").Router();
const passport = require("passport");
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator'); // Import express-validator

const CLIENT_URL = "http://localhost:5173/home";
const CLIENT_URL_LOGOUT = "http://localhost:5173/";

const userSignUpController = require("../controller/user/userSignUp");
const userSignInController = require("../controller/user/userSigIn");
const userDetailsController = require('../controller/user/userDetails');
const authToken = require('../middleware/authToken');

// Specific limiter for signup and signin routes
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // limit each IP to 5 attempts per hour
  message: "Too many signup or login attempts, please try again later."
});

// Validation middleware for signup
const signupValidation = [
  body('username').trim().notEmpty().withMessage('Username is required').escape(),
  body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long').escape()
];

// Validation middleware for signin
const signinValidation = [
  body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required').escape()
];

// Apply the authLimiter and validation middleware here:
router.post("/signup", authLimiter, signupValidation, authToken, userSignUpController);
router.post("/signin", authLimiter, signinValidation, authToken, userSignInController);
router.get("/user-details", authToken, userDetailsController);


router.get("/login/success", (req, res) => {
  if (req.user) {
    res.status(200).json({
      success: true,
      message: "successfull",
      user: req.user,
      //   cookies: req.cookies
    });
  }
});

router.get("/login/failed", (req, res) => {
  res.status(401).json({
    success: false,
    message: "failure",
  });
});

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect(CLIENT_URL_LOGOUT);
});

router.get("/google", passport.authenticate("google", { scope: ["profile"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: CLIENT_URL,
    failureRedirect: "/login/failed",
  })
);

router.get("/github", passport.authenticate("github", { scope: ["profile"] }));

router.get(
  "/github/callback",
  passport.authenticate("github", {
    successRedirect: CLIENT_URL,
    failureRedirect: "/login/failed",
  })
);

router.get("/facebook", passport.authenticate("facebook", { scope: ["profile"] }));

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: CLIENT_URL,
    failureRedirect: "/login/failed",
  })
);

module.exports = router