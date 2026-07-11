const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./reviews.js");

const listingCategories = [
  { key: "trending", label: "Trending", icon: "fa-solid fa-fire" },
  { key: "rooms", label: "Rooms", icon: "fa-solid fa-bed" },
  { key: "iconic-cities", label: "Iconic Cities", icon: "fa-solid fa-mountain-city" },
  { key: "mountains", label: "Mountains", icon: "fa-solid fa-mountain" },
  { key: "castles", label: "Castles", icon: "fa-solid fa-fort-awesome" },
  { key: "pools", label: "Amazing Pools", icon: "fa-solid fa-person-swimming" },
  { key: "camping", label: "Camping", icon: "fa-solid fa-campground" },
  { key: "farms", label: "Farms", icon: "fa-solid fa-cow" },
  { key: "arctic", label: "Arctic", icon: "fa-regular fa-snowflake" },
  { key: "domes", label: "Domes", icon: "fa-solid fa-igloo" },
  { key: "boats", label: "Boats", icon: "fa-solid fa-ship" },
];

const listingSchema = new Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    image: { url: String, filename: String },
    price: { type: Number, min: 0, required: true },
    location: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    category: { type: String, enum: listingCategories.map((category) => category.key), default: "trending", index: true },
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
    owner: { type: Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

listingSchema.index({ title: "text", location: "text", country: "text" });

listingSchema.post("findOneAndDelete", async(listing) => {
    if(listing){
        await Review.deleteMany({_id : {$in: listing.reviews}});
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
module.exports.listingCategories = listingCategories;
