const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { uploadToCloudinary } = require("../config/cloudinary");

router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }
    const result = await uploadToCloudinary(req.file.buffer, "olx-uploads");
    res.status(201).json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
});

router.post("/multiple", upload.array("images", 5), async (req, res) => {
  try {
    if (!req.files || !req.files.length) {
      return res.status(400).json({ message: "At least one image is required" });
    }
    const uploads = await Promise.all(
      req.files.map((file) => uploadToCloudinary(file.buffer, "olx-uploads"))
    );
    res.status(201).json({
      images: uploads.map((result) => ({
        url: result.secure_url,
        publicId: result.public_id,
      })),
    });
  } catch (error) {
    console.error("MULTIPLE UPLOAD ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
