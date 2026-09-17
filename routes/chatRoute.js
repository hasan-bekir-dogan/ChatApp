const express = require("express");
const chatController = require("../controllers/chatController");
const { requireAuthApi } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(requireAuthApi);

router.get("/", chatController.getChat);
router.post("/detail", chatController.getChatDetail);
router.post("/check-exist", chatController.checkChatExist);
router.post("/search", chatController.searchInChat);

module.exports = router;
