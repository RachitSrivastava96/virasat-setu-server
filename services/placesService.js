const axios = require("axios");

/* =====================
   FREE PLACES DATA SERVICE
   Uses: OpenStreetMap (Nominatim) + Wikipedia
===================== */

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