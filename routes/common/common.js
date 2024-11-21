// // common.js
// const express = require("express");
// const router = express.Router();
// const {
//   login,
//   initiateSignup,
//   signup,
//   userDetails,
//   logout,
//   updateUser,
//   resendOTP,
// } = require("../../controller/common/commonController");
// const authToken = require("../../middleware/authToken");

// router.post("/initiate-signup", initiateSignup);
// router.post("/signup", signup);
// router.post("/resend-otp", resendOTP);
// router.post("/login", login);
// router.get("/user-details", authToken, userDetails);
// router.get("/logout", logout);
// router.put("/update-user", authToken, updateUser);

// module.exports = router;

// common.js
const express = require("express");
const router = express.Router();
const {
  login,
  signup,
  userDetails,
  logout,
  updateUser,
  userAds,
  userAdsDelete,
} = require("../../controller/common/commonController");
const authToken = require("../../middleware/authToken");

router.post("/signup", signup);
router.post("/login", login);
router.get("/user-details", authToken, userDetails);
router.get("/user-ads", authToken, userAds);
router.delete("/user-ads/:id", authToken, userAdsDelete);
router.get("/logout", logout);
router.put("/update-user", authToken, updateUser);
module.exports = router;
