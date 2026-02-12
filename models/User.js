const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // OAuth fields
    googleId: {
      type: String,
      sparse: true, // Allows null values, but enforces uniqueness when present
      unique: true,
      index: true,
    },
    
    // Email/Password fields
    password: {
      type: String,
      // Only required if googleId is not present
      required: function() {
        return !this.googleId;
      },
    },
    
    // Common fields
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    
    // Account status
    isVerified: {
      type: Boolean,
      default: false, // Set to true for OAuth users, false for email/password
    },
    authMethod: {
      type: String,
      enum: ["google", "email"],
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Update lastLogin on each login
userSchema.methods.updateLastLogin = function () {
  this.lastLogin = Date.now();
  return this.save();
};

const User = mongoose.model("User", userSchema);

module.exports = User;