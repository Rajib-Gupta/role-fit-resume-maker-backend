const express = require("express");
const { signUp, login, logout, me } = require("../controllers/auth.controller");
const { body } = require("express-validator");
const { authMiddleware } = require("../middleware/auth.middleware");
const authRouter = express.Router();

/**
 * @route POST /api/auth/sign-up
 * @description Register a new user
 * @access Public
 */
authRouter.post("/sign-up", signUp);

/**
 * @route POST /api/auth/login
 * @description Login with user email and password
 * @access Public
 */
authRouter.post(
  "/login",
  [body("email").notEmpty().withMessage("Email should not be empty!")],
  body("password").notEmpty().withMessage("Password should not be empty!"),
  login,
);

/**
 * @route GET /api/auth/logout
 * @description Clear token from user cookie and add token in the blacklist
 * @access Public
 */
authRouter.get("/logout", logout);

/**
 * @route GET /api/auth/me
 * @description Fetched user data from database and send that to client
 * @access Public
 */

authRouter.get("/me", authMiddleware, me);

module.exports = authRouter;
