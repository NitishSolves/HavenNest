const Listing = require("../models/listing.js");
const { geocodeLocation } = require("../utils/geocode.js");
const { uploadBuffer } = require("../utils/cloudinaryUpload.js");

module.exports.index = async (req, res) => {
  const { category, q } = req.query;
  const filter = {};

  if (category) {
    filter.category = category;
  }

  if (q && q.trim()) {
    // Search by title, location, or country — case-insensitive.
    // A regex is fine at this catalog size; if the listing count grows into the
    // thousands, swap this for a MongoDB text index ($text) instead.
    const searchTerm = q.trim();
    filter.$or = [
      { title: { $regex: searchTerm, $options: "i" } },
      { location: { $regex: searchTerm, $options: "i" } },
      { country: { $regex: searchTerm, $options: "i" } },
    ];
  }

  const allListings = await Listing.find(filter);

  const title = q
    ? `“${q}” — Search results | HavenNest`
    : category
    ? `${category.replace(/-/g, " ")} stays | HavenNest`
    : "HavenNest — Find your next stay";

  res.render("listings/index.ejs", {
    allListings,
    categories: Listing.CATEGORIES,
    activeCategory: category || "",
    searchQuery: q || "",
    title,
    description: "Browse curated home stays worldwide — beachfront cottages, mountain chalets, city lofts, and more.",
  });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs", {
    categories: Listing.CATEGORIES,
    title: "List your home | HavenNest",
    description: "Create a new listing on HavenNest.",
  });
};

module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "That listing doesn't exist, or may have been removed.");
    return res.redirect("/listings");
  }

  const isFavorited = Boolean(
    req.user && req.user.favorites && req.user.favorites.some((favId) => favId.equals(listing._id))
  );

  res.render("listings/show.ejs", {
    listing,
    isFavorited,
    title: `${listing.title} — ${listing.location}, ${listing.country} | HavenNest`,
    description: listing.description ? listing.description.slice(0, 155) : "",
  });
};

module.exports.createListing = async (req, res) => {
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;

  if (req.file) {
    const result = await uploadBuffer(req.file.buffer);
    newListing.image = { url: result.secure_url, filename: result.public_id };
  }

  newListing.geometry = await geocodeLocation(req.body.listing.location, req.body.listing.country);

  await newListing.save();
  req.flash("success", "New listing created!");
  res.redirect(`/listings/${newListing._id}`);
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "That listing doesn't exist, or may have been removed.");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image ? listing.image.url : "";
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");

  res.render("listings/edit.ejs", {
    listing,
    originalImageUrl,
    categories: Listing.CATEGORIES,
    title: `Edit ${listing.title} | HavenNest`,
    description: "Edit your HavenNest listing.",
  });
};

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  const existing = await Listing.findById(id);

  if (!existing) {
    req.flash("error", "That listing doesn't exist, or may have been removed.");
    return res.redirect("/listings");
  }

  const locationChanged =
    req.body.listing.location !== existing.location || req.body.listing.country !== existing.country;

  Object.assign(existing, req.body.listing);

  if (req.file) {
    const result = await uploadBuffer(req.file.buffer);
    existing.image = { url: result.secure_url, filename: result.public_id };
  }

  if (locationChanged) {
    existing.geometry = await geocodeLocation(existing.location, existing.country);
  }

  await existing.save();
  req.flash("success", "Listing updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted.");
  res.redirect("/listings");
};

// Toggles a listing in the current user's wishlist. Idempotent per click,
// returns JSON so the card's heart icon can update without a full page reload.
module.exports.toggleFavorite = async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  const index = user.favorites.findIndex((favId) => favId.equals(id));
  let favorited;

  if (index === -1) {
    user.favorites.push(id);
    favorited = true;
  } else {
    user.favorites.splice(index, 1);
    favorited = false;
  }

  await user.save();

  if (req.headers.accept && req.headers.accept.includes("application/json")) {
    return res.json({ favorited });
  }

  req.flash("success", favorited ? "Added to your wishlist." : "Removed from your wishlist.");
  res.redirect("back");
};
