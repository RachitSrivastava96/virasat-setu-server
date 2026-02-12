const router = require("express").Router();
const passport = require("passport");

// start Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:3000",
    successRedirect: "http://localhost:3000",
  })
);

// logout
router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("http://localhost:3000");
  });
});

// current user
router.get("/me", (req, res) => {
  res.json(req.user || null);
});

module.exports = router;
