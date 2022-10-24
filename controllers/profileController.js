const { validationResult } = require("express-validator");
const User = require("../models/User");

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);

    res.status(200).json({
        data: {
          name: user.name,
          email: user.email,
        },
        status: "success",
      });
  } catch (error) {
    res.status(400).json({
      error,
      status: "fail",
    });
  }
};