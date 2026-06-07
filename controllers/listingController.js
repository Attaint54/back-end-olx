const Listing = require("../models/Listing");

exports.createListing = async (req, res, next) => {
  try {
    const { title, description, price, discountPercentage, rating, stock, brand, category, thumbnail, images, location, sellerName, sellerPhone } = req.body;
    if (!title || !description || price === undefined || !category) {
      return res.status(400).json({ error: "Title, description, price, and category are required." });
    }
    const listing = await Listing.create({
      title, description, price, discountPercentage, rating, stock, brand, category, thumbnail, images, location, sellerName, sellerPhone,
      seller: req.user ? req.user.id : undefined,
    });
    res.status(201).json(listing);
  } catch (error) {
    next(error);
  }
};

exports.getListings = async (req, res, next) => {
  try {
    const { limit = 20, skip = 0 } = req.query;
    const listings = await Listing.find().sort({ createdAt: -1 }).skip(Number(skip)).limit(Number(limit));
    const total = await Listing.countDocuments();
    res.json({ products: listings, total, skip: Number(skip), limit: Number(limit) });
  } catch (error) {
    next(error);
  }
};

exports.searchListings = async (req, res, next) => {
  try {
    const { q, limit = 20, skip = 0 } = req.query;
    if (!q) {
      return res.status(400).json({ error: "Search query is required." });
    }
    const listings = await Listing.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
      ],
    }).sort({ createdAt: -1 }).skip(Number(skip)).limit(Number(limit));
    const total = await Listing.countDocuments({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
      ],
    });
    res.json({ products: listings, total, skip: Number(skip), limit: Number(limit) });
  } catch (error) {
    next(error);
  }
};

exports.getListingsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const { limit = 20, skip = 0 } = req.query;
    const listings = await Listing.find({ category: { $regex: `^${category}$`, $options: "i" } }).sort({ createdAt: -1 }).skip(Number(skip)).limit(Number(limit));
    const total = await Listing.countDocuments({ category: { $regex: `^${category}$`, $options: "i" } });
    res.json({ products: listings, total, skip: Number(skip), limit: Number(limit) });
  } catch (error) {
    next(error);
  }
};

exports.getListingById = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found." });
    }
    res.json(listing);
  } catch (error) {
    next(error);
  }
};

exports.updateListing = async (req, res, next) => {
  try {
    const listing = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!listing) {
      return res.status(404).json({ error: "Listing not found." });
    }
    res.json(listing);
  } catch (error) {
    next(error);
  }
};

exports.deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findByIdAndDelete(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found." });
    }
    res.json({ message: "Listing deleted successfully." });
  } catch (error) {
    next(error);
  }
};
