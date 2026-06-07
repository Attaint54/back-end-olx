const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    stock: { type: Number, default: 0, min: 0 },
    brand: { type: String, default: "" },
    category: { type: String, required: true, trim: true },
    thumbnail: { type: String, default: "" },
    images: { type: [String], default: [] },
    location: { type: String, default: "" },
    sellerName: { type: String, default: "" },
    sellerPhone: { type: String, default: "" },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

listingSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

listingSchema.index({ title: "text", description: "text", category: 1, price: 1 });

module.exports = mongoose.model("Listing", listingSchema);
