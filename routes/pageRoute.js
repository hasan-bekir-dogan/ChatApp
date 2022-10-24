const { application } = require("express");
const express = require("express");
const pageController = require("../controllers/pageController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.route("/").get(authMiddleware, pageController.getIndexPage);
router.route("/login").get(pageController.getLoginPage);
router.route("/register").get(pageController.getRegisterPage);

module.exports = router;
