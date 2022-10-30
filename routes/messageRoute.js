const { application } = require("express");
const express = require("express");
const messageController = require("../controllers/messageController");
const { body } = require("express-validator");

const router = express.Router();

router.route("/send").post(messageController.sendMessage);
router.route('/delete').delete(messageController.deleteMessage);

module.exports = router;
