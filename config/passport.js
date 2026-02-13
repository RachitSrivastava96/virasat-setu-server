const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

// Determine callback URL based on environment
const getCallbackURL = () => {
  if (process.env.NODE_ENV === "production") {
    // Use your Render backend URL
    return `${process.env.BACKEND_URL || "https://virasat-setu-server.onrender.com"}/auth/google/callback`;
  }
  // Local development
  return "http://localhost:5000/auth/google/callback";
};

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: getCallbackURL(),
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // Create new user
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
          avatar: profile.photos[0].value,
          authMethod: "google",
          isVerified: true,
          });
          console.log(`New user created: ${user.email}`);
        } else {
          console.log(`Existing user logged in: ${user.email}`);
        }

        done(null, user);
      } catch (err) {
        console.error("OAuth error:", err);
        done(err, null);
      }
    }
  )
);

// Serialize user to session (store only user ID)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session (fetch full user from DB)
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    console.error("❌ Deserialize error:", err);
    done(err, null);
  }
});

module.exports = passport;