const express = require("express");
const spendingController = require("../controllers/spendingController");
const router = express.Router();

router.get("/",spendingController.getAllSpendings);
router.post("/",spendingController.createSpending);

module.exports = router;