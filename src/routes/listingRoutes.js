const express = require("express");
const router = express.Router();
const listingController = require("../controllers/listingController");
const upload = require("../middleware/upload");

router.get("/", listingController.getListings);
router.get("/search", listingController.searchListings);
router.get("/category/:category", listingController.getListingsByCategory);
router.get("/:id", listingController.getListingById);
router.post("/", upload.single("image"), listingController.createListing);
router.put("/:id", upload.single("image"), listingController.updateListing);
router.delete("/:id", listingController.deleteListing);

module.exports = router;
