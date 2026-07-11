/**
 * Geocodes a listing location into { lat, lng } using OpenStreetMap's
 * Nominatim API. We prioritize the exact text the user typed in the location
 * field, then fall back to the location + country combination.
 *
 * This keeps the saved coordinates as close as possible to the user's input
 * while still giving the geocoder a stronger hint when needed.
 */

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

async function geocodeLocation(location, country) {
  const locationText = typeof location === "string" ? location.trim() : "";
  const countryText = typeof country === "string" ? country.trim() : "";

  const queries = [];
  if (locationText) queries.push(locationText);
  if (locationText && countryText) queries.push(`${locationText}, ${countryText}`);
  if (countryText && !locationText) queries.push(countryText);

  for (const query of queries) {
    const url = `${NOMINATIM_URL}?q=${encodeURIComponent(query)}&format=json&limit=1`;

    try {
      const response = await fetch(url, {
        headers: {
          // Nominatim's usage policy requires a descriptive User-Agent identifying the app.
          "User-Agent": "HavenNest/1.0 (listing-geocoder)",
        },
      });

      if (!response.ok) continue;

      const results = await response.json();
      if (!Array.isArray(results) || results.length === 0) continue;

      const { lat, lon } = results[0];
      return {
        type: "Point",
        coordinates: [parseFloat(lon), parseFloat(lat)], // GeoJSON order: [lng, lat]
      };
    } catch (err) {
      console.error("Geocoding failed for query:", query, err.message);
    }
  }

  return null;
}

module.exports = { geocodeLocation };
