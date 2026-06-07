const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/authController");
const authenticate = require("../middleware/auth");
const upload = require("../middleware/upload");

router.post("/register", upload.single("image"), register);
router.post("/login", login);
router.get("/me", authenticate, getMe);

module.exports = router;
