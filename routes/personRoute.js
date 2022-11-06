const { application } = require("express");
const express = require("express");
const personController = require("../controllers/personController");
const { body } = require("express-validator");
const User = require("../models/User");

const router = express.Router();

router.route("/create").post(personController.createPerson);
router.route("/list").get(personController.listPerson);
router.route("/delete").delete(personController.deletePerson);

module.exports = router;
