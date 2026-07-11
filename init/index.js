if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const { geocodeLocation } = require("../utils/geocode.js");

const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/havennest";

main()
  .then(() => {
    console.log("HavenNest connected to MongoDB");
    initDB();
  })
  .catch((err) => console.error("MongoDB connection error:", err));

async function main() {
  await mongoose.connect(dbUrl);
}

const initDB = async () => {
  // SEED_OWNER_ID must be a real User _id in your database (sign up a user first,
  // then copy their _id from the `users` collection). The previous hardcoded ObjectId
  // pointed at a user that doesn't exist, which silently broke listing.owner.username
  // on the show page for every seeded listing.
  const ownerId = process.env.SEED_OWNER_ID;
  if (!ownerId) {
    console.error(
      "Refusing to seed: set SEED_OWNER_ID in your .env to an existing User _id first."
    );
    process.exit(1);
  }

  await Listing.deleteMany({});

  console.log("Geocoding sample listings — this respects Nominatim's 1 req/sec limit, so it takes a minute...");

  for (const listing of initData.data) {
    const geometry = await geocodeLocation(listing.location, listing.country);
    await Listing.create({ ...listing, owner: ownerId, geometry });
    await new Promise((resolve) => setTimeout(resolve, 1100)); // respect rate limit
  }

  console.log(`Seeded ${initData.data.length} listings.`);
  mongoose.connection.close();
};
