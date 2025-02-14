const router = require("express").Router();
const passport = require("passport");

const CLIENT_URL = "http://localhost:5173/home";
const CLIENT_URL_LOGOUT = "http://localhost:5173/";


const userSignUpController = require("../controller/user/userSignUp")
const userSignInController = require("../controller/user/userSigIn")
const userDetailsController = require('../controller/user/userDetails')
const authToken = require('../middleware/authToken')




router.post("/signup",authToken,userSignUpController)
router.post("/signin",authToken,userSignInController)
router.get("/user-details",authToken,userDetailsController)


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