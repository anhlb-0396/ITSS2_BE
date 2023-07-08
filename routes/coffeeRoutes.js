const express = require("express");
const authController = require("../controllers/authController");
const coffeeController = require("../controllers/coffeeController");
const uploadCoffeeImageController = require("../controllers/uploadCoffeeImageController");
const reviewController = require("../controllers/reviewController");
const bookmarkController = require("../controllers/bookmarkController");

const router = express.Router();

router.get("/", coffeeController.getAllCoffees);
router.post(
  "/",
  authController.protect,
  uploadCoffeeImageController.upload.array("images", 3),
  uploadCoffeeImageController.handlePostCoffeeImages,
  coffeeController.createCoffee
);

router.post(
  "/:id/reviews",
  authController.protect,
  reviewController.createReview
);

router.get("/:id/reviews", coffeeController.getCoffee);

router.post(
  "/:id/bookmarks",
  authController.protect,
  bookmarkController.createBookmark
);

router.delete(
  "/:id/bookmarks",
  authController.protect,
  bookmarkController.deleteBookmark
);

module.exports = router;
