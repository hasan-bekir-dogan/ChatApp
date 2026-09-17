const express = require("express");
const messageController = require("../controllers/messageController");
const { requireAuthApi } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(requireAuthApi);

router.post("/send", messageController.sendMessage);
router.delete("/delete", messageController.deleteMessage);

module.exports = router;
