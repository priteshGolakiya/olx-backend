// common.js
const express = require("express");
const router = express.Router();
const {
  login,
  signup,
  userDetails,
  logout,
  updateUser,
} = require("../../controller/common/commonController");
const authToken = require("../../middleware/authToken");

router.post("/signup", signup);
router.post("/login", login);
router.get("/user-details", authToken, userDetails);
router.get("/logout", logout);
router.put("/update-user", authToken, updateUser);
module.exports = router;
