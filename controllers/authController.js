const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, name: user.name, username: user.username, email: user.email, profilePicture: user.profilePicture },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

exports.register = async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body;
    if (!email || !password || !username) {
      return res.status(400).json({ error: "Username, email, and password are required." });
    }
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists." });
    }
    const profilePicture = req.file ? req.file.path : null;
    const user = await User.create({ name, username, email, password, profilePicture });
    const token = generateToken(user);
    res.status(201).json({
      message: "User registered successfully.",
      user: { id: user._id, name: user.name, username: user.username, email: user.email, profilePicture: user.profilePicture },
      token,
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required." });
    }
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password." });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid username or password." });
    }
    const token = generateToken(user);
    res.json({
      token,
      user: { id: user._id, name: user.name, username: user.username, email: user.email, profilePicture: user.profilePicture },
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    res.json({ user: { id: user._id, name: user.name, username: user.username, email: user.email, profilePicture: user.profilePicture } });
  } catch (error) {
    next(error);
  }
};
