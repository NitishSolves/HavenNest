/**
 * Geocodes a "location, country" string into { lat, lng } using OpenStreetMap's
 * Nominatim API. No API key required, which keeps this free to run in production.
 *
 * We geocode once, at create/update time, and persist the result on the listing
 * document (`geometry`). This is deliberate: geocoding on every page view would
 * be slower, would hammer Nominatim's rate limit (1 req/sec, no bulk use), and
 * risks the map silently breaking if the API is briefly unavailable.
 *
 * If geocoding fails (typo'd location, network hiccup, service down), we do NOT
 * block listing creation — we fall back to a null geometry and the show page
 * renders a friendly "map unavailable" state instead of a blank screen.
 */

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

async function geocodeLocation(location, country) {
  const query = [location, country].filter(Boolean).join(", ");
  if (!query) return null;

  const url = `${NOMINATIM_URL}?q=${encodeURIComponent(query)}&format=json&limit=1`;

  try {
    const response = await fetch(url, {
      headers: {
        // Nominatim's usage policy requires a descriptive User-Agent identifying the app.
        "User-Agent": "HavenNest/1.0 (listing-geocoder)",
      },
    });

    if (!response.ok) return null;

    const results = await response.json();
    if (!Array.isArray(results) || results.length === 0) return null;

    const { lat, lon } = results[0];
    return {
      type: "Point",
      coordinates: [parseFloat(lon), parseFloat(lat)], // GeoJSON order: [lng, lat]
    };
  } catch (err) {
    console.error("Geocoding failed for query:", query, err.message);
    return null;
  }
}

module.exports = { geocodeLocation };
