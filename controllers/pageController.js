const User = require("../models/User");

exports.getIndexPage = async (req, res) => {
  const user = await User.findOne({
    _id: req.session.userId,
  });

  res.status(200).render("index", {
    myName: user.name,
    myEmail: user.email,
    myProfilePhoto: user.image
  });
};

exports.getLoginPage = (req, res) => {
  res.status(200).render("auth/login");
};

exports.getRegisterPage = (req, res) => {
  res.status(200).render("auth/register");
};
