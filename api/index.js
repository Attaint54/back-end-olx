require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const app = require("../src/app");
const connectDB = require("../src/config/db");

let isConnected = false;

module.exports = async (req, res) => {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
      console.log("MongoDB connected successfully");
    } catch (error) {
      console.error("MongoDB connection error in serverless:", error.message);
      isConnected = false;
    }
  }
  return app(req, res);
};
