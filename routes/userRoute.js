const express = require("express");
const rateLimit = require("express-rate-limit");
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const User = require("../models/User");
const env = require("../config/env");

const router = express.Router();

// Credential endpoints are the ones worth brute forcing, so they get their own
// budgets. Login and registration are limited separately: a burst of failed
// logins from an office or mobile network should not also block the people
// behind that address from creating an account.
function credentialsLimiter(limit, windowMs) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: "Too many attempts. Please try again later.",
    // The suite signs several users in per test file and would otherwise run
    // into the limit instead of exercising the behaviour under test.
    skip: () => env.isTest,
  });
}

const loginLimiter = credentialsLimiter(20, 15 * 60 * 1000);
const signupLimiter = credentialsLimiter(10, 60 * 60 * 1000);

router.post(
  "/signup",
  signupLimiter,
  [
    body("name").trim().notEmpty().withMessage("Please enter your name."),
    body("email")
      .isEmail()
      .withMessage("Please enter valid email.")
      .normalizeEmail()
      .custom(async (email) => {
        const user = await User.findOne({ email });

        if (user) {
          throw new Error("Email is already exists!");
        }
      }),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long."),
  ],
  authController.createUser
);

router.post(
  "/login",
  loginLimiter,
  [
    body("email").trim().notEmpty().withMessage("Please enter an email."),
    body("password").notEmpty().withMessage("Please enter password."),
  ],
  authController.loginUser
);

router.get("/logout", authController.logoutUser);

module.exports = router;
