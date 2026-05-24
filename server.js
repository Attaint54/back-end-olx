require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL;

// 🔥 GET ALL PRODUCTS
app.get("/", async (req, res) => {
  try {
    const response = await axios.get(BASE_URL);

    // only products array
    res.json(response.data.products);

  } catch (error) {
    console.log("ERROR:", error.message);

    res.status(500).json({
      error: error.message
    });
  }
});

// 🔥 GET SINGLE PRODUCT
app.get("/product/:id", async (req, res) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/${req.params.id}`
    );

    res.json(response.data);

  } catch (error) {
    console.log("ERROR:", error.message);

    res.status(500).json({
      error: error.message
    });
  }
});

// ✅ Export for Vercel
module.exports = app;

// ✅ Local server
if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}