const fetch = require("node-fetch");

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

async function geocodeLocation(location, country) {
  const locationText = typeof location === "string" ? location.trim() : "";
  const countryText = typeof country === "string" ? country.trim() : "";

  const queries = [];
  if (locationText && countryText) queries.push(`${locationText}, ${countryText}`);
  if (locationText) queries.push(locationText);
  if (countryText && !locationText) queries.push(countryText);

  for (const query of queries) {
    const url = `${NOMINATIM_URL}?q=${encodeURIComponent(query)}&format=json&limit=1`;

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "HavenNest/1.0 (listing-geocoder)",
        },
      });

      if (!response.ok) continue;

      const results = await response.json();
      if (!Array.isArray(results) || results.length === 0) continue;

      const { lat, lon } = results[0];
      return {
        type: "Point",
        coordinates: [parseFloat(lon), parseFloat(lat)],
      };
    } catch (err) {
      console.error("Geocoding failed for query:", query, err.message);
    }
  }

  return null;
}

module.exports = { geocodeLocation };
