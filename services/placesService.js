const axios = require("axios");

/* =====================
   FREE PLACES DATA SERVICE
   Uses: OpenStreetMap (Nominatim) + Wikipedia
   + Static fallbacks for popular cities (more reliable on Render)
===================== */

// Curated data for popular Indian heritage cities used on the home page.
// This avoids relying on third‑party APIs for the most common searches.
const STATIC_CITY_DATA = {
  jaipur: {
    name: "Jaipur",
    state: "Rajasthan",
    coordinates: { latitude: 26.9124, longitude: 75.7873 },
    description:
      "The Pink City of Rajasthan, famous for its forts, palaces, and vibrant bazaars.",
    image:
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&q=80",
    places: {
      monuments: [
        {
          id: "jaipur-amber-fort",
          name: "Amber Fort",
          category: "Monument",
          address: "Devisinghpura, Amer, Jaipur, Rajasthan",
          description:
            "A majestic hilltop fort overlooking Maota Lake, known for its architecture and light shows.",
          image:
            "https://images.unsplash.com/photo-1587314168485-3236c89c9aef?w=1200&q=80",
        },
        {
          id: "jaipur-hawa-mahal",
          name: "Hawa Mahal",
          category: "Monument",
          address: "Badi Choupad, Jaipur, Rajasthan",
          description:
            "The iconic Palace of Winds with hundreds of jharokha windows overlooking the old city.",
          image:
            "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?w=1200&q=80",
        },
      ],
      restaurants: [
        {
          id: "jaipur-lmb",
          name: "Laxmi Mishthan Bhandar (LMB)",
          category: "Restaurant",
          address: "Johari Bazaar, Jaipur, Rajasthan",
          description:
            "Legendary sweet shop and restaurant serving authentic Rajasthani thalis and sweets.",
          image:
            "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200&q=80",
        },
      ],
      hotels: [
        {
          id: "jaipur-city-palace-view-hotel",
          name: "Heritage Stay near City Palace",
          category: "Hotel",
          address: "Old City, Jaipur, Rajasthan",
          description:
            "A boutique heritage stay with views of the old city and traditional Rajasthani décor.",
          image:
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80",
        },
      ],
      attractions: [],
    },
  },
  varanasi: {
    name: "Varanasi",
    state: "Uttar Pradesh",
    coordinates: { latitude: 25.3176, longitude: 82.9739 },
    description:
      "One of the oldest living cities in the world, known for its ghats, temples, and Ganga aarti.",
    image:
      "https://images.unsplash.com/photo-1583391733956-6c7823f3c8a0?w=1200&q=80",
    places: {
      monuments: [
        {
          id: "varanasi-dashashwamedh-ghat",
          name: "Dashashwamedh Ghat",
          category: "Ghat",
          address: "Dashashwamedh Ghat, Varanasi, Uttar Pradesh",
          description:
            "The most famous ghat of Varanasi, known for the grand evening Ganga aarti.",
          image:
            "https://images.unsplash.com/photo-1529253355930-ddbe423a2acb?w=1200&q=80",
        },
      ],
      restaurants: [
        {
          id: "varanasi-kashi-chaat-bhandar",
          name: "Kashi Chaat Bhandar",
          category: "Restaurant",
          address: "Godowlia, Varanasi, Uttar Pradesh",
          description:
            "Popular local spot for chaats and street food flavours of Kashi.",
          image:
            "https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?w=1200&q=80",
        },
      ],
      hotels: [
        {
          id: "varanasi-ghat-homestay",
          name: "Ghat-side Homestay",
          category: "Hotel",
          address: "Near Assi Ghat, Varanasi, Uttar Pradesh",
          description:
            "A homely stay close to the ghats, ideal for sunrise boat rides and walks.",
          image:
            "https://images.unsplash.com/photo-1540556159711-2f436a70e9a6?w=1200&q=80",
        },
      ],
      attractions: [],
    },
  },
  hampi: {
    name: "Hampi",
    state: "Karnataka",
    coordinates: { latitude: 15.335, longitude: 76.46 },
    description:
      "A UNESCO World Heritage Site with surreal boulder landscapes and ruins of the Vijayanagara Empire.",
    image:
      "https://images.unsplash.com/photo-1609920658906-8223bd289001?w=1200&q=80",
    places: {
      monuments: [
        {
          id: "hampi-vitthal-temple",
          name: "Vijaya Vittala Temple",
          category: "Monument",
          address: "Hampi, Karnataka",
          description:
            "Iconic temple complex known for its stone chariot and musical pillars.",
          image:
            "https://images.unsplash.com/photo-1541417904950-b855846fe074?w=1200&q=80",
        },
      ],
      restaurants: [
        {
          id: "hampi-riverside-cafe",
          name: "Riverside Café",
          category: "Restaurant",
          address: "Near Tungabhadra River, Hampi, Karnataka",
          description:
            "A relaxed café serving South Indian and traveller-friendly meals with river views.",
          image:
            "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=1200&q=80",
        },
      ],
      hotels: [
        {
          id: "hampi-heritage-guesthouse",
          name: "Heritage Guesthouse",
          category: "Hotel",
          address: "Hampi Bazaar, Hampi, Karnataka",
          description:
            "Simple, comfortable guesthouse popular with backpackers exploring the ruins.",
          image:
            "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80",
        },
      ],
      attractions: [],
    },
  },
  udaipur: {
    name: "Udaipur",
    state: "Rajasthan",
    coordinates: { latitude: 24.5854, longitude: 73.7125 },
    description:
      "The City of Lakes, known for its palaces, havelis, and romantic lakeside views.",
    image:
      "https://images.unsplash.com/photo-1587135941948-670b381f08ce?w=1200&q=80",
    places: {
      monuments: [
        {
          id: "udaipur-city-palace",
          name: "City Palace, Udaipur",
          category: "Palace",
          address: "Old City, Udaipur, Rajasthan",
          description:
            "A grand palace complex on the banks of Lake Pichola, showcasing Mewar history.",
          image:
            "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80",
        },
      ],
      restaurants: [
        {
          id: "udaipur-lakeside-dining",
          name: "Lakeside Dining",
          category: "Restaurant",
          address: "Near Lake Pichola, Udaipur, Rajasthan",
          description:
            "Romantic rooftop dining with views of the lake and lit‑up palaces.",
          image:
            "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200&q=80",
        },
      ],
      hotels: [
        {
          id: "udaipur-haveli-stay",
          name: "Haveli Stay",
          category: "Hotel",
          address: "Old City, Udaipur, Rajasthan",
          description:
            "Traditional haveli converted into a boutique stay with courtyards and frescoes.",
          image:
            "https://images.unsplash.com/photo-1563298723-dcfebaa392e3?w=1200&q=80",
        },
      ],
      attractions: [],
    },
  },
  pondicherry: {
    name: "Pondicherry",
    state: "Tamil Nadu",
    coordinates: { latitude: 11.9416, longitude: 79.8083 },
    description:
      "A coastal town blending French colonial charm, colourful streets, and seaside promenades.",
    image:
      "https://images.unsplash.com/photo-1605518216938-7c31b0ad6a94?w=1200&q=80",
    places: {
      monuments: [
        {
          id: "pondicherry-promenade-beach",
          name: "Promenade Beach",
          category: "Beach",
          address: "White Town, Pondicherry",
          description:
            "Popular seafront promenade lined with cafes, colonial buildings, and statues.",
          image:
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80",
        },
      ],
      restaurants: [
        {
          id: "pondicherry-french-bistro",
          name: "French‑Indian Bistro",
          category: "Restaurant",
          address: "White Town, Pondicherry",
          description:
            "Cosy bistro serving a mix of South Indian flavours and French‑inspired dishes.",
          image:
            "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80",
        },
      ],
      hotels: [
        {
          id: "pondicherry-heritage-guesthouse",
          name: "Heritage Guesthouse",
          category: "Hotel",
          address: "Heritage Quarter, Pondicherry",
          description:
            "Colourful colonial‑style stay with courtyards and quiet streets nearby.",
          image:
            "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?w=1200&q=80",
        },
      ],
      attractions: [],
    },
  },
  khajuraho: {
    name: "Khajuraho",
    state: "Madhya Pradesh",
    coordinates: { latitude: 24.8318, longitude: 79.9199 },
    description:
      "Famous for its UNESCO‑listed temple complex with intricate sculptures and architecture.",
    image:
      "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=1200&q=80",
    places: {
      monuments: [
        {
          id: "khajuraho-western-group",
          name: "Western Group of Temples",
          category: "Temple Complex",
          address: "Sevagram, Khajuraho, Madhya Pradesh",
          description:
            "The main temple complex housing exquisitely carved temples dedicated to various deities.",
          image:
            "https://images.unsplash.com/photo-1583745549635-1c00da239194?w=1200&q=80",
        },
      ],
      restaurants: [
        {
          id: "khajuraho-local-thali",
          name: "Local Thali House",
          category: "Restaurant",
          address: "Near Temple Road, Khajuraho",
          description:
            "Simple eatery serving hearty North Indian thalis to pilgrims and travellers.",
          image:
            "https://images.unsplash.com/photo-1604908176997-125188dcfdb7?w=1200&q=80",
        },
      ],
      hotels: [
        {
          id: "khajuraho-temple-view-lodge",
          name: "Temple View Lodge",
          category: "Hotel",
          address: "Near Western Group of Temples, Khajuraho",
          description:
            "Comfortable lodge within walking distance of the main temple complex.",
          image:
            "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80",
        },
      ],
      attractions: [],
    },
  },
};

class PlacesService {
  constructor() {
    this.nominatimBaseUrl = "https://nominatim.openstreetmap.org";
    this.wikipediaBaseUrl = "https://en.wikipedia.org/w/api.php";
    this.unsplashBaseUrl = "https://api.unsplash.com";
    // You can get a free Unsplash API key from https://unsplash.com/developers
    this.unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY || "demo";
  }

  /**
   * Search for places in a city
   * @param {string} cityName - Name of the city
   * @param {string} category - Category (monument, restaurant, etc.)
   * @returns {Promise<Array>} Array of places
   */
  async searchPlaces(cityName, category = "tourism") {
    try {
      // Map categories to OpenStreetMap tags
      const categoryMap = {
        monument: "historic=monument",
        temple: "amenity=place_of_worship",
        restaurant: "amenity=restaurant",
        cafe: "amenity=cafe",
        hotel: "tourism=hotel",
        museum: "tourism=museum",
        attraction: "tourism=attraction",
        market: "amenity=marketplace",
      };

      const osmTag = categoryMap[category] || "tourism=attraction";

      // First, get city coordinates
      const cityData = await this.geocodeCity(cityName);
      if (!cityData) {
        throw new Error("City not found");
      }

      const { lat, lon, displayName } = cityData;

      // Search for places using Overpass API (OpenStreetMap)
      const overpassQuery = `
        [out:json];
        (
          node["${osmTag}"](around:10000,${lat},${lon});
          way["${osmTag}"](around:10000,${lat},${lon});
        );
        out center 20;
      `;

      const overpassUrl = "https://overpass-api.de/api/interpreter";
      const response = await axios.post(
        overpassUrl,
        `data=${encodeURIComponent(overpassQuery)}`,
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          timeout: 10000,
        }
      );

      const places = await Promise.all(
        response.data.elements.slice(0, 10).map(async (element) => {
          const placeLat = element.lat || element.center?.lat;
          const placeLon = element.lon || element.center?.lon;

          // Get place details from Wikipedia if available
          const wikiData = await this.getWikipediaInfo(
            element.tags?.name || "Unknown"
          );

          return {
            id: element.id,
            name: element.tags?.name || "Unknown Place",
            category: category,
            latitude: placeLat,
            longitude: placeLon,
            address: element.tags?.["addr:full"] || displayName,
            description:
              wikiData?.extract ||
              element.tags?.description ||
              `A ${category} in ${cityName}`,
            image:
              wikiData?.image || (await this.getUnsplashImage(element.tags?.name, cityName)),
            rating: 4.0 + Math.random(), // Mock rating
            website: element.tags?.website || null,
            phone: element.tags?.phone || null,
          };
        })
      );

      return places.filter((p) => p.name !== "Unknown Place");
    } catch (error) {
      console.error("Error searching places:", error.message);
      throw error;
    }
  }

  /**
   * Get city coordinates from name
   * @param {string} cityName - Name of the city
   * @returns {Promise<Object>} City data with coordinates
   */
  async geocodeCity(cityName) {
    try {
      const response = await axios.get(`${this.nominatimBaseUrl}/search`, {
        params: {
          q: `${cityName}, India`,
          format: "json",
          limit: 1,
          addressdetails: 1,
        },
        headers: {
          "User-Agent": "Virasat-Setu/1.0",
        },
      });

      if (response.data.length === 0) {
        return null;
      }

      const city = response.data[0];
      return {
        lat: parseFloat(city.lat),
        lon: parseFloat(city.lon),
        displayName: city.display_name,
        state: city.address?.state || "",
      };
    } catch (error) {
      console.error("Geocoding error:", error.message);
      return null;
    }
  }

  /**
   * Get Wikipedia information about a place
   * @param {string} placeName - Name of the place
   * @returns {Promise<Object>} Wikipedia data
   */
  async getWikipediaInfo(placeName) {
    try {
      const response = await axios.get(this.wikipediaBaseUrl, {
        params: {
          action: "query",
          format: "json",
          prop: "extracts|pageimages",
          exintro: true,
          explaintext: true,
          piprop: "original",
          titles: placeName,
          redirects: 1,
        },
      });

      const pages = response.data.query?.pages;
      if (!pages) return null;

      const page = Object.values(pages)[0];
      if (page.missing) return null;

      return {
        extract: page.extract?.substring(0, 200) + "..." || null,
        image: page.original?.source || null,
      };
    } catch (error) {
      console.error("Wikipedia API error:", error.message);
      return null;
    }
  }

  /**
   * Get image from Unsplash
   * @param {string} placeName - Name of the place
   * @param {string} cityName - Name of the city
   * @returns {Promise<string>} Image URL
   */
  async getUnsplashImage(placeName, cityName) {
    try {
      if (this.unsplashAccessKey === "demo") {
        // Return placeholder if no API key
        return `https://source.unsplash.com/800x600/?${encodeURIComponent(
          cityName
        )},${encodeURIComponent(placeName)}`;
      }

      const response = await axios.get(`${this.unsplashBaseUrl}/search/photos`, {
        params: {
          query: `${placeName} ${cityName} India`,
          per_page: 1,
        },
        headers: {
          Authorization: `Client-ID ${this.unsplashAccessKey}`,
        },
      });

      return (
        response.data.results[0]?.urls?.regular ||
        `https://source.unsplash.com/800x600/?${encodeURIComponent(cityName)}`
      );
    } catch (error) {
      return `https://source.unsplash.com/800x600/?${encodeURIComponent(cityName)}`;
    }
  }

  /**
   * Get comprehensive city information
   * @param {string} cityName - Name of the city
   * @returns {Promise<Object>} Complete city data
   */
  async getCityInfo(cityName) {
    try {
      // First, try static curated data for popular cities used on the home page.
      // This makes sure those cities always load quickly, even if external APIs are slow.
      const normalizedName = cityName.trim().toLowerCase();
      if (STATIC_CITY_DATA[normalizedName]) {
        return STATIC_CITY_DATA[normalizedName];
      }

      const cityData = await this.geocodeCity(cityName);
      if (!cityData) {
        throw new Error("City not found");
      }

      // Get Wikipedia info about the city
      const wikiInfo = await this.getWikipediaInfo(cityName);

      // Get places by category
      const [monuments, restaurants, hotels, attractions] = await Promise.all([
        this.searchPlaces(cityName, "monument"),
        this.searchPlaces(cityName, "restaurant"),
        this.searchPlaces(cityName, "hotel"),
        this.searchPlaces(cityName, "attraction"),
      ]);

      return {
        name: cityName,
        state: cityData.state,
        coordinates: {
          latitude: cityData.lat,
          longitude: cityData.lon,
        },
        description: wikiInfo?.extract || `Explore ${cityName}, India`,
        image:
          wikiInfo?.image ||
          (await this.getUnsplashImage(cityName, "India")),
        places: {
          monuments: monuments.slice(0, 6),
          restaurants: restaurants.slice(0, 6),
          hotels: hotels.slice(0, 4),
          attractions: attractions.slice(0, 6),
        },
      };
    } catch (error) {
      console.error("Error getting city info:", error.message);
      throw error;
    }
  }
}

module.exports = new PlacesService();