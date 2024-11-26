const express = require("express");
const router = express.Router();
const {
  getApprovalRequests,
  approveRequest,
  bulkProcessProducts,
  getRejectProduct,
  getAllProduct
} = require("../../controller/admin/product/productController");

router.get("/", getAllProduct);
router.get("/approval-requests", getApprovalRequests);
router.get("/reject-product", getRejectProduct);
router.put("/approve-request/:productId", approveRequest);
router.post("/bulk-process", bulkProcessProducts);
module.exports = router;
