// One-off script to backfill authMethod for existing Google users.
// Usage:
//   NODE_ENV=production node scripts/backfillAuthMethod.js
//
// Make sure your .env (or Render env) has MONGO_URI set.

const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../models/User");

async function run() {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.error("MONGO_URI is not set. Aborting.");
      process.exit(1);
    }

    await mongoose.connect(uri);
    console.log("Connected to MongoDB");

    // Find users created via Google that are missing authMethod
    const candidates = await User.find({
      googleId: { $ne: null },
      $or: [{ authMethod: { $exists: false } }, { authMethod: null }],
    });

    if (!candidates.length) {
      console.log("No users found that need authMethod backfill.");
      process.exit(0);
    }

    console.log(`Found ${candidates.length} user(s) to update.`);

    for (const user of candidates) {
      user.authMethod = "google";
      if (user.isVerified === undefined || user.isVerified === false) {
        user.isVerified = true;
      }
      await user.save();
      console.log(`Updated user ${user.email} (${user._id})`);
    }

    console.log("Backfill complete.");
    process.exit(0);
  } catch (err) {
    console.error("Backfill error:", err);
    process.exit(1);
  }
}

run();

