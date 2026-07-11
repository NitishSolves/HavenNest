const Listing = require("../models/listing.js");
const { listingCategories } = require("../models/listing.js");

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

module.exports.home = async (req, res) => {
    const featuredListings = await Listing.find({}).sort({ createdAt: -1 }).limit(6);
    res.render("listings/index.ejs", {
        allListings: featuredListings,
        categories: listingCategories,
        activeCategory: "",
        searchQuery: "",
        isHome: true,
        pageTitle: "HavenNest | Curated stays for memorable escapes",
        metaDescription: "Discover polished vacation homes, city apartments, cabins, villas, and unique stays on HavenNest.",
    });
};

module.exports.index = async (req, res)=>{
    const { q = "", category = "" } = req.query;
    const query = {};
    if (category && listingCategories.some((item) => item.key === category)) query.category = category;
    if (q.trim()) {
        const safeQuery = new RegExp(escapeRegex(q.trim()), "i");
        query.$or = [{ title: safeQuery }, { location: safeQuery }, { country: safeQuery }];
    }
    const allListings= await Listing.find(query).sort({ createdAt: -1, _id: -1 });
    res.render("listings/index.ejs", {
        allListings,
        categories: listingCategories,
        activeCategory: category,
        searchQuery: q,
        isHome: false,
        pageTitle: q ? `Search stays for ${q} | HavenNest` : "Explore stays | HavenNest",
        metaDescription: "Search HavenNest stays by city, destination, property name, and travel style.",
    });
};

module.exports.renderNewForm = (req, res)=>{
    res.render("listings/new.ejs", { categories: listingCategories, pageTitle: "List your stay | HavenNest", metaDescription: "Create a HavenNest listing for your home, cabin, villa, or apartment." });
};

module.exports.showListing = async (req, res)=>{
    let {id}= req.params;
    const listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author" }}).populate("owner");
    if(!listing){ req.flash("error", "The listing you requested no longer exists."); return res.redirect("/listings"); }
    res.render("listings/show.ejs", { listing, pageTitle: `${listing.title} in ${listing.location} | HavenNest`, metaDescription: listing.description });
};

module.exports.createListing = async (req, res) =>{
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    if (req.file) newListing.image = { url: req.file.path, filename: req.file.filename };
    await newListing.save();
    req.flash("success", "Your HavenNest listing is live.");
    res.redirect(`/listings/${newListing._id}`);
};

module.exports.renderEditForm = async (req, res)=>{
    let {id}= req.params;
    const listing = await Listing.findById(id);
    if(!listing){ req.flash("error", "The listing you requested no longer exists."); return res.redirect("/listings"); }
    let originalImageUrl = listing.image && listing.image.url ? listing.image.url.replace("/upload", "/upload/w_250") : "";
    res.render("listings/edit.ejs", {listing, originalImageUrl, categories: listingCategories, pageTitle: `Edit ${listing.title} | HavenNest`, metaDescription: "Update your HavenNest listing."});
};

module.exports.updateListing = async (req, res)=>{
   let{id}= req.params;
   let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { runValidators: true, new: true });
   if(req.file){ listing.image = {url: req.file.path, filename: req.file.filename}; await listing.save(); }
    req.flash("success", "Listing updated.");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) =>{
    let {id}= req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted.");
    res.redirect("/listings");
};
