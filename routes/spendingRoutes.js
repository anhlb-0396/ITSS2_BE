const express = require("express");
const spendingController = require("../controllers/spendingController");
const router = express.Router();

router.get("/",spendingController.getAllSpendings);
router.post("/",spendingController.createSpending);
router.get("/statistics",spendingController.getAllSpendingsStatistic);
router.get("/ratios",spendingController.getRatiosBetweenSpendingsAndLimits);

module.exports = router;