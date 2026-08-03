const mongoose = require("mongoose");

const blacklistToken = new mongoose.Schema(
  {
    token: {
      type: String,
      required: [true, "Token is required to be added in blacklist"],
    },
  },
  {
    timestamps: true,
  },
);

const tokenBlackList = mongoose.model("blackListToken", blacklistToken);

module.exports = tokenBlackList;
