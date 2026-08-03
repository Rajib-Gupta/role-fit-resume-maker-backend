require("dotenv").config();

const app = require("../src/app");
const connectToDB = require("../src/config/database");

let dbPromise;

async function ensureDbConnection() {
  if (!dbPromise) {
    dbPromise = connectToDB();
  }
  return dbPromise;
}

module.exports = async function vercelHandler(req, res) {
  try {
    await ensureDbConnection();
    return app(req, res);
  } catch (error) {
    console.error("Vercel function failed:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
