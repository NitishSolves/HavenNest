const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./reviews.js");

const CATEGORIES = [
  { value: "trending", label: "Trending", icon: "fa-solid fa-fire" },
  { value: "rooms", label: "Rooms", icon: "fa-solid fa-bed" },
  { value: "iconic-cities", label: "Iconic Cities", icon: "fa-solid fa-mountain-city" },
  { value: "mountains", label: "Mountains", icon: "fa-solid fa-mountain" },
  { value: "castles", label: "Castles", icon: "fa-solid fa-fort-awesome" },
  { value: "pools", label: "Amazing Pools", icon: "fa-solid fa-person-swimming" },
  { value: "camping", label: "Camping", icon: "fa-solid fa-campground" },
  { value: "farms", label: "Farms", icon: "fa-solid fa-cow" },
  { value: "arctic", label: "Arctic", icon: "fa-regular fa-snowflake" },
  { value: "domes", label: "Domes", icon: "fa-solid fa-igloo" },
  { value: "boats", label: "Boats", icon: "fa-solid fa-ship" },
];

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  image: {
    url: String,
    filename: String,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  country: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: CATEGORIES.map((c) => c.value),
    default: "trending",
  },
  geometry: {
    type: {
      type: String,
      enum: ["Point"],
    },
    coordinates: {
      type: [Number],
    },
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

listingSchema.index({ geometry: "2dsphere" });

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
module.exports.CATEGORIES = CATEGORIES;
