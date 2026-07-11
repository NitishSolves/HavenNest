const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB — keep uploads reasonable
  fileFilter: (req, file, cb) => {
    const allowed = ["image/png", "image/jpeg"];
    cb(null, allowed.includes(file.mimetype));
  },
});

// Index (supports ?q= and ?category= for search/filter) & Create
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(isLoggedIn, upload.single("listing[image]"), validateListing, wrapAsync(listingController.createListing));

// New
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Edit
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

// Wishlist toggle
router.post("/:id/favorite", isLoggedIn, wrapAsync(listingController.toggleFavorite));

// Show, Update & Delete
router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(isLoggedIn, isOwner, upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListing))
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

module.exports = router;
