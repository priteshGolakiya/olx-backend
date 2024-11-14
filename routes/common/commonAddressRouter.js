const express = require("express");
const router = express.Router();
const {
  getUserAddresses,
  getUserAddressById,
  createUserAddress,
  updateUserAddressById,
  deleteUserAddressById,
} = require("../../controller/common/address/addressController");

router.get("/", getUserAddresses);

router.get("/:addressId", getUserAddressById);

router.post("/", createUserAddress);

router.put("/:addressId", updateUserAddressById);

router.delete("/:addressId", deleteUserAddressById);

module.exports = router;
