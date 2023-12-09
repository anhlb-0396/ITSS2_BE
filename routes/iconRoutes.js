const express = require("express");
const iconController = require("../controllers/iconController");
const router = express.Router();

router.get("/",iconController.getAllIcons);
router.post("/",iconController.createIcon);

module.exports = router;