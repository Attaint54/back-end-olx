const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { uploadToCloudinary } = require("../config/cloudinary");

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, name: user.name, username: user.username, email: user.email, profilePicture: user.profilePicture },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

exports.register = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    if (!email || !password || !username) {
      return res.status(400).json({ message: "Username, email, and password are required." });
    }
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists." });
    }

    let profilePicture = null;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "olx-profiles");
      profilePicture = result.secure_url;
    }

    const user = await User.create({ name, username, email, password, profilePicture });
    const token = generateToken(user);
    res.status(201).json({
      message: "User registered successfully.",
      user: { id: user._id, name: user.name, username: user.username, email: user.email, profilePicture: user.profilePicture },
      token,
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error.message);
    if (error.code === 11000) {
      return res.status(409).json({ message: "User already exists." });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: Object.values(error.errors).map((e) => e.message).join(", ") });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password." });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password." });
    }
    const token = generateToken(user);
    res.json({
      token,
      user: { id: user._id, name: user.name, username: user.username, email: user.email, profilePicture: user.profilePicture },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json({ user: { id: user._id, name: user.name, username: user.username, email: user.email, profilePicture: user.profilePicture } });
  } catch (error) {
    console.error("GETME ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};
