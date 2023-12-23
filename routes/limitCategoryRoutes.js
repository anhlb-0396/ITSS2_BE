const express = require("express");
const limitCategoryController = require("../controllers/limitCategoryController");
const router = express.Router();

router.get("/", limitCategoryController.getAllLimitCategories);
router.post("/", limitCategoryController.createLimitCategorySpending);

module.exports = router;
