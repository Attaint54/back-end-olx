const express = require("express");
const router = express.Router();
const {
  createListing,
  getListings,
  searchListings,
  getListingsByCategory,
  getListingById,
  updateListing,
  deleteListing,
} = require("../controllers/listingController");

router.get("/", getListings);
router.get("/search", searchListings);
router.get("/category/:category", getListingsByCategory);
router.get("/:id", getListingById);
router.post("/add", createListing);
router.put("/:id", updateListing);
router.delete("/:id", deleteListing);

module.exports = router;
