const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
require("dotenv").config();

require("./config/passport"); // passport strategies

const app = express();

/* =====================
   MIDDLEWARE
===================== */

// CORS
// Allow Render + local frontend
app.use(
  cors({
    origin: true, // allow all origins (safe for hackathon)
    credentials: true,
  })
);

app.use(express.json());

// Session middleware (REQUIRED for OAuth)
app.use(
  session({
    name: "virasat-setu-session",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS on Render
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

/* =====================
   ROUTES
===================== */

// Health check (VERY IMPORTANT for Render)
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Root test route
app.get("/", (req, res) => {
  res.send("Server running");
});

// Auth routes
app.use("/auth", require("./routes/authRoutes"));

/* =====================
   DATABASE + SERVER
===================== */

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:");
    console.error(err.message);
    process.exit(1); // crash on DB failure (important for Render)
  });
