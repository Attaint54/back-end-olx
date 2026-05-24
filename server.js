require("dotenv").config();

const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL;

// 🔥 ROOT ROUTE = PRODUCTS
app.get("/", async (req, res) => {
  try {
    const response = await axios.get(BASE_URL);

    // send ONLY products array
    res.json(response.data.products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// 🔥 SINGLE PRODUCT (optional but useful)
app.get("/product/:id", async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Product not found" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});