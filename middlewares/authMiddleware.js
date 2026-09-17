const User = require("../models/User");

async function loadSessionUser(req) {
  if (!req.session || !req.session.userId) return null;

  return User.findById(req.session.userId);
}

/**
 * Guards rendered pages. Anonymous visitors are sent to the login screen.
 */
async function requireAuthPage(req, res, next) {
  try {
    const user = await loadSessionUser(req);

    if (!user) {
      return res.redirect("/login");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Guards JSON endpoints. Answers with 401 instead of an HTML redirect so the
 * browser client can react to the failure.
 */
async function requireAuthApi(req, res, next) {
  try {
    const user = await loadSessionUser(req);

    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "Authentication required.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Keeps signed-in users away from the login and register screens.
 */
async function redirectIfAuthenticated(req, res, next) {
  try {
    const user = await loadSessionUser(req);

    if (user) {
      return res.redirect("/");
    }

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = { requireAuthPage, requireAuthApi, redirectIfAuthenticated };
