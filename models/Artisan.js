const mongoose = require("mongoose");

const artisanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
      index: true,
    },
    state: {
      type: String,
      required: true,
    },
    specialty: {
      type: String,
      required: true,
      enum: [
        "Block Printing",
        "Blue Pottery",
        "Handicrafts",
        "Textile Weaving",
        "Wood Carving",
        "Metal Work",
        "Jewelry Making",
        "Leather Craft",
        "Painting",
        "Sculpture",
        "Embroidery",
        "Basket Weaving",
        "Other",
      ],
    },
    description: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
    },
    website: {
      type: String,
    },
    image: {
      type: String,
      default: "",
    },
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient city-based queries
artisanSchema.index({ city: 1, specialty: 1 });

const Artisan = mongoose.model("Artisan", artisanSchema);

module.exports = Artisan;