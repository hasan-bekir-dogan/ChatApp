const { application } = require("express");
const express = require("express");
const chatController = require("../controllers/chatController");
const { body } = require("express-validator");

const router = express.Router();

router.route("/").get(chatController.getChat);
router.route("/detail").post(chatController.getChatDetail);

module.exports = router;
