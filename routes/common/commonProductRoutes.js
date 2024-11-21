const express = require("express");
const router = express.Router();
const checkToken = require("../../middleware/authToken");
const {
  getAllProduct,
  getProductById,
  sellProduct,
  editProduct,
  deleteProduct,
  uploadProduct,
  getUserProduct,
  getProductsByCategory,
} = require("../../controller/common/product/productController");

router.get("/", getAllProduct);
router.get("/get-userProduct", checkToken, getUserProduct);
router.get("/category/:categoryId", getProductsByCategory);
router.get("/:id", getProductById);
router.post("/uploadProduct", checkToken, uploadProduct);
router.post("/sell/:id", checkToken, sellProduct);
router.put("/:id", checkToken, editProduct);
router.delete("/:id", checkToken, deleteProduct);
module.exports = router;
