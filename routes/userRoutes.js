const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const bookmarkController = require("../controllers/bookmarkController");
const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.route("/").get(userController.getAllUsers);

module.exports = router;
