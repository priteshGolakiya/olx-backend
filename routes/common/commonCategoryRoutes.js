const express = require("express");
const router = express.Router();
const {
  getAllCategories,
  getCategoryById,
  getProductByCategoryId
} = require("../../controller/common/categories/categoriesController.js");

router.get("/", getAllCategories);
router.get("/:id", getCategoryById);
router.get("/:id/product", getProductByCategoryId);
module.exports = router;
