require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const listingRoutes = require("./routes/listingRoutes");
const categoryRoutes = require("./routes/categoryRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/", authRoutes);
app.use("/products/categories", categoryRoutes);
app.use("/products", listingRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

module.exports = app;

if (process.env.VERCEL !== "1") {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }).catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });
}
