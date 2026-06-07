const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const listingRoutes = require("./routes/listingRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res.json({ message: "API is running" });
});

app.use("/", authRoutes);
app.use("/products/categories", categoryRoutes);
app.use("/products", listingRoutes);
app.use("/upload", uploadRoutes);

app.use((err, _req, res, _next) => {
  if (err) {
    return res.status(400).json({ message: err.message });
  }
});

app.use(errorHandler);

module.exports = app;
