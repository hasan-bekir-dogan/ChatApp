const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const User = require("../models/User");

exports.createUser = async (req, res) => {
  try {
    if (req.body.password !== req.body.confirmPassword) {
      req.flash("error", "Password and Confirm Password must be same!");

      res.status(400).redirect("/register");
    } else {
      const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      });

      res.status(201).redirect("/login");
    }
  } catch (error) {
    const errors = validationResult(req);

    for (let i = 0; i < errors.array().length; i++) {
      req.flash("error", `${errors.array()[i].msg}`);
    }

    res.status(400).redirect("/register");
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).then((user) => {
      if (user) {
        bcrypt.compare(password, user.password, (err, same) => {
          if (same) {
            req.session.userId = user._id;
            res.status(200).redirect("/");
          } else {
            req.flash("error", "Your password is not correct!");
            res.status(200).redirect("/login");
          }
        });
      } else {
        const errors = validationResult(req);

        for (let k = 0; k < errors.array().length; k++) {
          req.flash("error", `${errors.array()[k].msg}`);
        }

        if (errors.array().length === 0) req.flash("error", "User not exists!");

        res.status(400).redirect("/login");
      }
    });
  } catch (error) {
    const errors = validationResult(req);

    for (let i = 0; i < errors.array().length; i++) {
      req.flash("error", `${errors.array()[i].msg}`);
    }

    req.status(400).redirect("/login");
  }
};

exports.logoutUser = async (req, res) => {
  try {
    req.session.destroy(() => {
      res.redirect("/login");
    });
  } catch (error) {
    res.status(404).json({
      error,
      status: "fail",
    });
  }
};
