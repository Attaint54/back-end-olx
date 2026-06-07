const Category = require("../models/Category");
const Listing = require("../models/Listing");

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    if (categories.length > 0) {
      return res.json(categories);
    }
    const distinctCategories = await Listing.distinct("category");
    const result = distinctCategories.map((cat) => ({
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      slug: cat.toLowerCase().replace(/\s+/g, "-"),
    }));
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { name, slug } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ error: "Name and slug are required." });
    }
    const category = await Category.create({ name: name.trim(), slug: slug.trim().toLowerCase() });
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};
