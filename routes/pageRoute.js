const { application } = require("express");
const express = require("express");
const pageController = require("../controllers/pageController");

const router = express.Router();

router.route("/").get(pageController.getIndexPage);
router.route("/login").get(pageController.getLoginPage);
router.route('/register').get(pageController.getRegisterPage);

module.exports = router;
