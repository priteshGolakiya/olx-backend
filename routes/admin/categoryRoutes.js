const express = require("express");
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  createAllCategories,
} = require("../../controller/admin/category/categoryController");

const router = express.Router();

// Routes for categories
router.post("/createAllCategories", createAllCategories);
router.post("/", createCategory);
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

module.exports = router;
