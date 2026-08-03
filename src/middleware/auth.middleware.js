const jwt = require("jsonwebtoken");
const tokenBlackList = require("../models/blacklist.model");

const authMiddleware = async (request, response, next) => {
  const token = request.cookies.token;
  try {
    if (!token) {
      return response.status(401).json({ message: "Unauthorize access" });
    }

    const isTokenBlackListed = await tokenBlackList.findOne({ token });

    if (isTokenBlackListed) {
      return response.status(401).json({ message: " Token is Invalid!" });
    }

    const decode = jwt.verify(token, process.env.JWT_SECERET);
    request.user = decode;

    next();
  } catch (error) {
    console.log(error);
    return response.status(401).json({ message: "Invalid token!" });
  }
};

module.exports = { authMiddleware };
