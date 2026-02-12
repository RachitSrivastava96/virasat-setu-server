const mongoose = require("mongoose");
require("dotenv").config();

const Artisan = require("./models/Artisan");

const sampleArtisans = [
  // Jaipur Artisans
  {
    name: "Anokhi Block Printing Workshop",
    city: "Jaipur",
    state: "Rajasthan",
    specialty: "Hand Block Printing",
    category: "textile",
    description: "Traditional Rajasthani block printing on fabrics. Watch artisans create intricate patterns using wooden blocks.",
    address: "Tilak Nagar, Jaipur",
    contact: {
      phone: "+91-141-2630519",
      website: "https://anokhi.com",
    },
    location: {
      type: "Point",
      coordinates: [75.8223, 26.9124], // [longitude, latitude]
    },
    images: [
      "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800",
    ],
    priceRange: "$$",
    verified: true,
  },
  {
    name: "Jaipur Blue Pottery Art Centre",
    city: "Jaipur",
    state: "Rajasthan",
    specialty: "Blue Pottery",
    category: "pottery",
    description: "Unique Persian-influenced pottery with vibrant blue glaze. Watch live demonstrations and buy authentic pieces.",
    address: "Amer Road, Jaipur",
    contact: {
      phone: "+91-141-2530607",
    },
    location: {
      type: "Point",
      coordinates: [75.8472, 26.9855],
    },
    images: [
      "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800",
    ],
    priceRange: "$$$",
    verified: true,
  },
  {
    name: "Maniharon Ka Rasta Jewelry Market",
    city: "Jaipur",
    state: "Rajasthan",
    specialty: "Kundan & Meenakari Jewelry",
    category: "jewelry",
    description: "Traditional Rajasthani jewelry makers creating exquisite Kundan and Meenakari pieces using ancient techniques.",
    address: "Johri Bazaar, Jaipur",
    contact: {},
    location: {
      type: "Point",
      coordinates: [75.8267, 26.9219],
    },
    images: [
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800",
    ],
    priceRange: "$$$$",
    verified: true,
  },

  // Varanasi Artisans
  {
    name: "Banarasi Silk Weaving Centre",
    city: "Varanasi",
    state: "Uttar Pradesh",
    specialty: "Banarasi Silk Sarees",
    category: "textile",
    description: "Watch master weavers create intricate Banarasi silk sarees on traditional handlooms. Each saree takes weeks to complete.",
    address: "Peeli Kothi, Varanasi",
    contact: {
      phone: "+91-542-2450215",
    },
    location: {
      type: "Point",
      coordinates: [82.9739, 25.3176],
    },
    images: [
      "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800",
    ],
    priceRange: "$$$",
    verified: true,
  },
  {
    name: "Varanasi Brassware Artisans",
    city: "Varanasi",
    state: "Uttar Pradesh",
    specialty: "Brass Metalwork",
    category: "metalwork",
    description: "Traditional brass workers creating religious idols, lamps, and decorative items using age-old techniques.",
    address: "Thatheri Bazaar, Varanasi",
    contact: {},
    location: {
      type: "Point",
      coordinates: [82.9849, 25.3221],
    },
    images: [
      "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800",
    ],
    priceRange: "$$",
    verified: true,
  },

  // Udaipur Artisans
  {
    name: "Miniature Painting School",
    city: "Udaipur",
    state: "Rajasthan",
    specialty: "Rajasthani Miniature Painting",
    category: "painting",
    description: "Learn about traditional Rajasthani miniature paintings. Artists create intricate scenes using natural pigments and single-hair brushes.",
    address: "City Palace Road, Udaipur",
    contact: {
      phone: "+91-294-2419021",
    },
    location: {
      type: "Point",
      coordinates: [73.6833, 24.5854],
    },
    images: [
      "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800",
    ],
    priceRange: "$$$",
    verified: true,
  },

  // Khajuraho Artisans
  {
    name: "Stone Carving Workshop",
    city: "Khajuraho",
    state: "Madhya Pradesh",
    specialty: "Stone Sculpture",
    category: "other",
    description: "Traditional stone carvers creating intricate sculptures inspired by Khajuraho temples. See ancient techniques in action.",
    address: "Main Market, Khajuraho",
    contact: {},
    location: {
      type: "Point",
      coordinates: [79.9199, 24.8318],
    },
    images: [
      "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800",
    ],
    priceRange: "$$",
    verified: true,
  },

  // Pondicherry Artisans
  {
    name: "Auroville Pottery",
    city: "Pondicherry",
    state: "Tamil Nadu",
    specialty: "Contemporary Pottery",
    category: "pottery",
    description: "Modern and traditional pottery techniques. Beautiful ceramic pieces inspired by Indian and international styles.",
    address: "Auroville, Pondicherry",
    contact: {
      website: "https://auroville.org",
    },
    location: {
      type: "Point",
      coordinates: [79.8083, 11.9959],
    },
    images: [
      "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800",
    ],
    priceRange: "$$",
    verified: true,
  },
];

async function seedArtisans() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing artisans (optional - comment out if you want to keep existing)
    await Artisan.deleteMany({});
    console.log("🗑️  Cleared existing artisans");

    // Insert sample artisans
    await Artisan.insertMany(sampleArtisans);
    console.log(`✅ Successfully seeded ${sampleArtisans.length} artisans`);

    mongoose.connection.close();
    console.log("✅ Database connection closed");
  } catch (error) {
    console.error("❌ Error seeding artisans:", error);
    process.exit(1);
  }
}

// Run the seed function
seedArtisans();