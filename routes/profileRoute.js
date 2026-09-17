const express = require("express");
const profileController = require("../controllers/profileController");
const { requireAuthApi } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(requireAuthApi);

router.get("/", profileController.getProfile);
router.put("/update", profileController.updateProfile);

module.exports = router;
