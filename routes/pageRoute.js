const express = require("express");
const pageController = require("../controllers/pageController");
const {
  requireAuthPage,
  redirectIfAuthenticated,
} = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", requireAuthPage, pageController.getIndexPage);
router.get("/login", redirectIfAuthenticated, pageController.getLoginPage);
router.get("/register", redirectIfAuthenticated, pageController.getRegisterPage);

module.exports = router;
