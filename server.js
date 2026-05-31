require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL;
const JWT_SECRET = process.env.JWT_SECRET;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "olx-profile-pictures",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
  },
});

const upload = multer({ storage });

const users = [];

const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }
  try {
    const decoded = jwt.verify(header.split(" ")[1], JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};

app.post("/register", upload.single("image"), async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }
    if (users.find((u) => u.email === email)) {
      return res.status(409).json({ error: "User already exists." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const profilePicture = req.file ? req.file.path : null;
    const user = { id: users.length + 1, name, username, email, password: hashedPassword, profilePicture };
    users.push(user);
    const token = jwt.sign({ id: user.id, name: user.name, username: user.username, email: user.email, profilePicture: user.profilePicture }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ message: "User registered successfully.", user: { id: user.id, name: user.name, username: user.username, email: user.email, profilePicture: user.profilePicture }, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required." });
    }
    const user = users.find((u) => u.username === username);
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password." });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid username or password." });
    }
    const token = jwt.sign({ id: user.id, name: user.name, username: user.username, email: user.email, profilePicture: user.profilePicture }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, name: user.name, username: user.username, email: user.email, profilePicture: user.profilePicture } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/me", authenticate, (req, res) => {
  res.json({ user: req.user });
});

// 🔥 HOME
app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

// 🔥 GET ALL PRODUCTS
app.get("/products", async (req, res) => {
  try {
    const response = await axios.get(BASE_URL);

    res.json(response.data.products);

  } catch (error) {
    console.error("ERROR:", error.message);

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
    console.error("ERROR:", error.message);

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