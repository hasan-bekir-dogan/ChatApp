const express = require("express");
const personController = require("../controllers/personController");
const { requireAuthApi } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(requireAuthApi);

router.post("/create", personController.createPerson);
router.get("/list", personController.listPerson);
router.delete("/delete", personController.deletePerson);

module.exports = router;
