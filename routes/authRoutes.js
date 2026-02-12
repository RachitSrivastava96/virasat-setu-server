const router = require("express").Router();
const passport = require("passport");

// Get frontend URL from environment or default to localhost
const getFrontendURL = () => {
  return process.env.FRONTEND_URL || "http://localhost:3000";
};

/* =====================
   GOOGLE OAUTH ROUTES
===================== */

// Start Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { 
    scope: ["profile", "email"],
    prompt: "select_account", // Force account selection
  })
);

// Google callback - FIXED: Redirect to home page (/) instead of /dashboard
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${getFrontendURL()}/?error=auth_failed`,
  }),
  (req, res) => {
    // Success - redirect to frontend home page
    res.redirect(`${getFrontendURL()}/`);
  }
);

/* =====================
   SESSION MANAGEMENT
===================== */

// Logout
router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Session destruction failed" });
      }
      res.clearCookie("virasat-setu-session");
      res.json({ message: "Logged out successfully" });
    });
  });
});

// Alternative GET logout (for redirect-based logout)
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
    }
    req.session.destroy(() => {
      res.redirect(getFrontendURL());
    });
  });
});

/* =====================
   USER INFO
===================== */

// Get current user
router.get("/me", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ 
      authenticated: false,
      user: null 
    });
  }
  
  res.json({
    authenticated: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar,
    },
  });
});

// Check authentication status
router.get("/status", (req, res) => {
  res.json({
    authenticated: !!req.user,
    sessionID: req.sessionID,
  });
});

module.exports = router;