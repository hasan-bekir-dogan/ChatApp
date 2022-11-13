const { application } = require("express");
const express = require("express");
const profileController = require("../controllers/profileController");
const { body } = require("express-validator");
const User = require("../models/User");

const router = express.Router();

router.route("/").get(profileController.getProfile);
router.route('/update').put(profileController.updateProfile);

module.exports = router;
