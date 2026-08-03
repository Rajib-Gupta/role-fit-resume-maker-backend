const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const tokenBlackList = require("../models/blacklist.model");

// Register a User in the server
const signUp = async (req, res) => {
  const { username, email, password } = req.body;
  console.log("username", username);
  try {
    // Check if usrer is already exists
    const isUserExists = await userModel.findOne({
      $or: [{ email }, { username }],
    });

    if (isUserExists)
      return res.status(400).json({ message: "User is already exists!" });

    // Hash the password
    const hashPassword = await bcrypt.hash(password, 10);

    // Create the user is database
    const user = new userModel({
      username,
      email,
      password: hashPassword,
    });
    await user.save();

    // generate token
    const token = await jwt.sign(
      {
        id: user._id,
        username: user.username,
      },
      process.env.JWT_SECERET,
      {
        expiresIn: "1d",
      },
    );
    res.cookie("token", token);

    res.status(201).json({
      message: " User created successfully!",
      user: {
        id: user._id,
        userbname: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({ message: "Server Timeout!" });
  }
};

// Login user
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: " User doesn't exists!" });
    }

    // check if password is valid

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: " Password is not valid!" });
    }

    const token = await jwt.sign(
      {
        id: user._id,
        username: user.username,
      },
      process.env.JWT_SECERET,
      {
        expiresIn: "1d",
      },
    );

    res.cookie("token", token);

    res.status(200).json({
      message: "Login Successfull!",
      user: {
        id: user._id,
        userbname: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Timeout!" });
  }
};

const logout = async (req, res) => {
  const token = req.cookies.token;
  try {
    if (token) {
      await tokenBlackList.create({ token });
    }
    res.clearCookie("token");
    res.status(200).json({ message: "Logout successful!" });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({ message: "Server timeout!" });
  }
};

// Get me data

const me = async (req, res) => {
  try {
    const userData = await userModel.findById(req.user.id).select("-password");;
    delete userData.password;
    res
      .status(200)
      .json({ message: "User fetched Successfully!", user: userData });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({ message: "Server Timeout!" });
  }
};

module.exports = { signUp, login, logout, me };
