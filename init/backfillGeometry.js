
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const { geocodeLocation } = require("../utils/geocode.js");

const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/havennest";

function hasValidGeometry(listing) {
  return (
    listing.geometry &&
    Array.isArray(listing.geometry.coordinates) &&
    listing.geometry.coordinates.length === 2
  );
}

async function run() {
  await mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });
  console.log("Connected to MongoDB for geometry backfill.");

  const listings = await Listing.find({});
  const toFix = listings.filter((l) => !hasValidGeometry(l));

  if (toFix.length === 0) {
    console.log(
      "Nothing to backfill — every listing already has valid geometry."
    );
    await mongoose.connection.close();
    return;
  }

  console.log(
    `Backfilling geometry for ${toFix.length} listing(s). Respecting Nominatim's 1 req/sec limit...`
  );

  let succeeded = 0;
  let failed = 0;

  for (const listing of toFix) {
    const geometry = await geocodeLocation(listing.location, listing.country);

    if (geometry) {
      listing.geometry = geometry;
      await listing.save();
      succeeded++;
      console.log(
        `  ✓ ${listing.title} — ${listing.location}, ${listing.country}`
      );
    } else {
      failed++;
      console.warn(
        `  ✗ ${listing.title} — could not geocode "${listing.location}, ${listing.country}"`
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 1100));
  }

  console.log(
    `Backfill complete: ${succeeded} succeeded, ${failed} failed (will retry on-demand when viewed).`
  );
  await mongoose.connection.close();
}

run().catch((err) => {
  console.error("Geometry backfill failed:", err);
  process.exit(1);
});
