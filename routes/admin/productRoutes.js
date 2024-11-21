const express = require("express");
const router = express.Router();
const {
  getApprovalRequests,
  approveRequest,
} = require("../../controller/admin/product/productController");

router.get("/approval-requests", getApprovalRequests);
router.put("/approve-request/:id", approveRequest);

module.exports = router;
