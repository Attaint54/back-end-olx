const Listing = require("../models/Listing");
const { uploadToCloudinary } = require("../config/cloudinary");

exports.createListing = async (req, res) => {
  try {
    const { title, description, price, discountPercentage, rating, stock, brand, category, location, sellerName, sellerPhone } = req.body;
    if (!title || !description || price === undefined || !category) {
      return res.status(400).json({ message: "Title, description, price, and category are required." });
    }

    let thumbnail = "";
    let images = [];

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "olx-products");
      thumbnail = result.secure_url;
      images = [result.secure_url];
    }

    const listing = await Listing.create({
      title, description, price: Number(price), discountPercentage, rating, stock, brand, category, thumbnail, images, location, sellerName, sellerPhone,
      seller: req.user ? req.user.id : undefined,
    });

    res.status(201).json(listing.toJSON());
  } catch (error) {
    console.error("CREATE LISTING ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.getListings = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const skip = Math.max(parseInt(req.query.skip, 10) || 0, 0);

    const [listings, total] = await Promise.all([
      Listing.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Listing.countDocuments(),
    ]);

    res.json({
      products: listings.map((l) => l.toJSON()),
      total,
      skip,
      limit,
    });
  } catch (error) {
    console.error("GET LISTINGS ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.searchListings = async (req, res) => {
  try {
    const query = (req.query.q || "").trim();
    if (!query) {
      return res.json({ products: [], total: 0, skip: 0, limit: 20 });
    }

    const regex = new RegExp(query, "i");
    const listings = await Listing.find({
      $or: [{ title: regex }, { description: regex }, { category: regex }],
    }).sort({ createdAt: -1 });

    res.json({
      products: listings.map((l) => l.toJSON()),
      total: listings.length,
      skip: 0,
      limit: listings.length,
    });
  } catch (error) {
    console.error("SEARCH ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.getListingsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const skip = Math.max(parseInt(req.query.skip, 10) || 0, 0);

    const filter = { category: { $regex: `^${category}$`, $options: "i" } };
    const [listings, total] = await Promise.all([
      Listing.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Listing.countDocuments(filter),
    ]);

    res.json({
      products: listings.map((l) => l.toJSON()),
      total,
      skip,
      limit,
    });
  } catch (error) {
    console.error("CATEGORY ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.getListingById = async (req, res) => {
  try {
    const listing = await Listing.findOne({ listingId: Number(req.params.id) });
    if (!listing) {
      return res.status(404).json({ message: "Listing not found." });
    }
    res.json(listing.toJSON());
  } catch (error) {
    console.error("GET LISTING ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.updateListing = async (req, res) => {
  try {
    const listing = await Listing.findOne({ listingId: Number(req.params.id) });
    if (!listing) {
      return res.status(404).json({ message: "Listing not found." });
    }

    const { title, description, price, category, discountPercentage, rating, stock, brand, location, sellerName, sellerPhone } = req.body;

    if (title) listing.title = title;
    if (description) listing.description = description;
    if (price) listing.price = Number(price);
    if (category) listing.category = category;
    if (discountPercentage) listing.discountPercentage = discountPercentage;
    if (rating) listing.rating = rating;
    if (stock) listing.stock = stock;
    if (brand) listing.brand = brand;
    if (location) listing.location = location;
    if (sellerName) listing.sellerName = sellerName;
    if (sellerPhone) listing.sellerPhone = sellerPhone;

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "olx-products");
      listing.thumbnail = result.secure_url;
      listing.images = [result.secure_url];
    }

    await listing.save();
    res.json(listing.toJSON());
  } catch (error) {
    console.error("UPDATE ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findOneAndDelete({ listingId: Number(req.params.id) });
    if (!listing) {
      return res.status(404).json({ message: "Listing not found." });
    }
    res.json({ message: "Listing deleted successfully." });
  } catch (error) {
    console.error("DELETE ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};
