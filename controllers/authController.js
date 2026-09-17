const { validationResult } = require("express-validator");
const User = require("../models/User");
const { asString } = require("../utils/query");

function flashValidationErrors(req, fallbackMessage) {
  const errors = validationResult(req).array();

  if (errors.length === 0) {
    req.flash("error", fallbackMessage);
    return;
  }

  errors.forEach((error) => req.flash("error", error.msg));
}

exports.createUser = async (req, res, next) => {
  try {
    if (!validationResult(req).isEmpty()) {
      flashValidationErrors(req, "Registration failed.");
      return res.redirect("/register");
    }

    if (req.body.password !== req.body.confirmPassword) {
      req.flash("error", "Password and Confirm Password must be same!");
      return res.redirect("/register");
    }

    await User.create({
      name: asString(req.body.name),
      email: asString(req.body.email).toLowerCase(),
      password: asString(req.body.password),
    });

    res.redirect("/login");
  } catch (error) {
    if (error.name === "ValidationError" || error.code === 11000) {
      req.flash("error", "Registration failed. Please check your details.");
      return res.redirect("/register");
    }

    next(error);
  }
};

exports.loginUser = async (req, res, next) => {
  try {
    if (!validationResult(req).isEmpty()) {
      flashValidationErrors(req, "Login failed.");
      return res.redirect("/login");
    }

    const email = asString(req.body.email).toLowerCase();
    const password = asString(req.body.password);
    const user = await User.findOne({ email });

    // The same message is used for an unknown address and a wrong password so
    // the response cannot be used to enumerate registered users.
    const passwordMatches = user ? await user.comparePassword(password) : false;

    if (!passwordMatches) {
      req.flash("error", "E-mail or password is not correct!");
      return res.redirect("/login");
    }

    // A fresh session id on login closes the session fixation window.
    req.session.regenerate((error) => {
      if (error) return next(error);

      req.session.userId = user._id;
      res.redirect("/");
    });
  } catch (error) {
    next(error);
  }
};

exports.logoutUser = (req, res, next) => {
  req.session.destroy((error) => {
    if (error) return next(error);

    res.clearCookie("chatapp.sid");
    res.redirect("/login");
  });
};
