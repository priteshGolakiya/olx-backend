const express = require("express");
const router = express.Router();
const {
  getApprovalRequests,
  approveRequest,
  bulkProcessProducts,
} = require("../../controller/admin/product/productController");

router.get("/approval-requests", getApprovalRequests);
router.put("/approve-request/:productId", approveRequest);
router.post("/bulk-process", bulkProcessProducts);
module.exports = router;
