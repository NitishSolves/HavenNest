const express = require("express");
const router = express.Router();

router.get("/privacy", (req, res) => {
  res.render("pages/privacy.ejs", {
    title: "Privacy Policy — HavenNest",
    description: "How HavenNest collects, uses, and protects your information.",
  });
});

router.get("/terms", (req, res) => {
  res.render("pages/terms.ejs", {
    title: "Terms of Service — HavenNest",
    description: "The terms that govern your use of HavenNest.",
  });
});

module.exports = router;
