exports.getIndexPage = (req, res) => {
  res.status(200).render("index");
};

exports.getLoginPage = (req, res) => {
  res.status(200).render("auth/login");
};

exports.getRegisterPage = (req, res) => {
  res.status(200).render("auth/register");
};
