const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
  {
    listingId: { type: Number, unique: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    stock: { type: Number, default: 0, min: 0 },
    brand: { type: String, default: "", trim: true },
    category: { type: String, required: true, trim: true },
    thumbnail: { type: String, default: "" },
    images: { type: [String], default: [] },
    location: { type: String, default: "", trim: true },
    sellerName: { type: String, default: "", trim: true },
    sellerPhone: { type: String, default: "", trim: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

listingSchema.pre("save", async function (next) {
  if (!this.isNew) return next();
  try {
    const Counter = mongoose.model("Counter");
    const counter = await Counter.findOneAndUpdate(
      { name: "listingId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.listingId = counter.seq;
    next();
  } catch (err) {
    next(err);
  }
});

listingSchema.methods.toJSON = function () {
  const obj = this.toObject();
  return {
    id: obj.listingId,
    title: obj.title,
    description: obj.description,
    price: obj.price,
    discountPercentage: obj.discountPercentage,
    rating: obj.rating,
    stock: obj.stock,
    brand: obj.brand,
    category: obj.category,
    thumbnail: obj.thumbnail,
    images: obj.images.length ? obj.images : [obj.thumbnail],
    location: obj.location,
    sellerName: obj.sellerName,
    sellerPhone: obj.sellerPhone,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
};

listingSchema.index({ title: "text", description: "text", category: 1, price: 1 });

const counterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 },
});

const Listing = mongoose.model("Listing", listingSchema);
mongoose.model("Counter", counterSchema);

module.exports = Listing;
