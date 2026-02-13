const router = require("express").Router();
const placesService = require("../services/placesService");
const Artisan = require("../models/Artisan");
const { isAuthenticated } = require("../middleware/auth");

/* =====================
   PUBLIC ROUTES
===================== */

/**
 * GET /api/places/city/:cityName
 * Get comprehensive city information
 */
router.get("/city/:cityName", async (req, res) => {
  try {
    const { cityName } = req.params;

    // Get city info from OpenStreetMap + Wikipedia
    const cityData = await placesService.getCityInfo(cityName);

    // Get artisans from our custom database
    const artisans = await Artisan.find({
      city: new RegExp(cityName, "i"),
    })
      .limit(6)
      .lean();

    const artisanImage = (a) =>
      a.image || `https://source.unsplash.com/600x400/?${a.specialty},craft`;

    res.json({
      city: {
        name: cityData.name,
        state: cityData.state || "",
        description: cityData.description || `Explore ${cityName}, India`,
        wikiUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(cityName)}`,
      },
      data: {
        monuments: cityData.places?.monuments || [],
        restaurants: cityData.places?.restaurants || [],
        hotels: cityData.places?.hotels || [],
        artisans: artisans.map((a) => ({
          id: a._id,
          name: a.name,
          specialty: a.specialty,
          description: a.description,
          address: a.address,
          images: [artisanImage(a)],
          contact: a.phone ? { phone: a.phone } : undefined,
          phone: a.phone,
          website: a.website,
        })),
      },
    });
  } catch (error) {
    console.error("City info error:", error);
    res.status(500).json({ 
      error: "Failed to fetch city information",
      message: error.message 
    });
  }
});

/**
 * GET /api/places/search
 * Search for specific places in a city
 */
router.get("/search", async (req, res) => {
  try {
    const { city, category } = req.query;

    if (!city) {
      return res.status(400).json({ error: "City parameter is required" });
    }

    const places = await placesService.searchPlaces(
      city,
      category || "attraction"
    );

    res.json({ places });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ 
      error: "Search failed",
      message: error.message 
    });
  }
});

/**
 * GET /api/places/artisans/:city
 * Get artisans in a specific city
 */
router.get("/artisans/:city", async (req, res) => {
  try {
    const { city } = req.params;
    const { specialty } = req.query;

    const query = { city: new RegExp(city, "i") };
    if (specialty) {
      query.specialty = specialty;
    }

    const artisans = await Artisan.find(query).lean();

    res.json({ artisans });
  } catch (error) {
    console.error("Artisans fetch error:", error);
    res.status(500).json({ error: "Failed to fetch artisans" });
  }
});

/* =====================
   PROTECTED ROUTES
   (Require authentication)
===================== */

/**
 * POST /api/places/artisan
 * Add a new artisan (authenticated users only)
 */
router.post("/artisan", isAuthenticated, async (req, res) => {
  try {
    const { name, city, state, specialty, description, address, phone, email, website, image } = req.body;

    // Validation
    if (!name || !city || !specialty || !description) {
      return res.status(400).json({ 
        error: "Name, city, specialty, and description are required" 
      });
    }

    const newArtisan = new Artisan({
      name,
      city,
      state,
      specialty,
      description,
      address,
      phone,
      email,
      website,
      image,
      addedBy: req.user._id,
      verified: false, // Admin can verify later
    });

    await newArtisan.save();

    res.status(201).json({
      message: "Artisan added successfully",
      artisan: newArtisan,
    });
  } catch (error) {
    console.error("Add artisan error:", error);
    res.status(500).json({ error: "Failed to add artisan" });
  }
});

/**
 * GET /api/places/hot-cities
 * Get popular cities with images
 */
router.get("/hot-cities", async (req, res) => {
  try {
    const hotCities = [
      { name: "Jaipur", state: "Rajasthan" },
      { name: "Varanasi", state: "Uttar Pradesh" },
      { name: "Hampi", state: "Karnataka" },
      { name: "Udaipur", state: "Rajasthan" },
      { name: "Pondicherry", state: "Tamil Nadu" },
      { name: "Khajuraho", state: "Madhya Pradesh" },
    ];

    const citiesWithData = await Promise.all(
      hotCities.map(async (city) => {
        const cityData = await placesService.geocodeCity(city.name);
        const wikiInfo = await placesService.getWikipediaInfo(city.name);
        
        return {
          name: city.name,
          state: city.state,
          description: wikiInfo?.extract?.substring(0, 100) || `Explore ${city.name}`,
          image: wikiInfo?.image || `https://source.unsplash.com/800x600/?${city.name},India`,
        };
      })
    );

    res.json({ cities: citiesWithData });
  } catch (error) {
    console.error("Hot cities error:", error);
    res.status(500).json({ error: "Failed to fetch hot cities" });
  }
});

module.exports = router;