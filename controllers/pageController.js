exports.getIndexPage = (req, res) => {
  res.status(200).render("index", {
    myUserId: req.user._id,
    myName: req.user.name,
    myEmail: req.user.email,
    myProfilePhoto: req.user.image,
  });
};

exports.getLoginPage = (req, res) => {
  res.status(200).render("auth/login");
};

exports.getRegisterPage = (req, res) => {
  res.status(200).render("auth/register");
};
