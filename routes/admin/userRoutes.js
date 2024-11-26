const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  toggleUserRestriction,
  deleteUser,
  updateUserRole,
  getUserById,
  checkUserProductRejections,
  updateRejectionThreshold,
} = require("../../controller/admin/user/userController");

router.get("/", getAllUsers);
router.get("/:userId", getUserById);
router.patch("/:userId/toggle-restriction", toggleUserRestriction);
router.delete("/:userId", deleteUser);
router.patch("/:userId/role", updateUserRole);
router.get("/:userId/product-rejections", checkUserProductRejections);
router.put("/:userId/rejection-threshold", updateRejectionThreshold);

module.exports = router;
