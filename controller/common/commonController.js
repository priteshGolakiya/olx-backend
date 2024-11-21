// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const { clearCookie } = require("cookie-parser");
// const User = require("../../models/userModel");
// const twilio = require("twilio");

// // Initialize Twilio client with your credentials
// const client = twilio(
//   process.env.TWILIO_ACCOUNT_SID,
//   process.env.TWILIO_AUTH_TOKEN
// );

// const VERIFY_SERVICE_ID = process.env.TWILIO_VERIFY_SERVICE_ID;

// // Send OTP via Twilio Verify
// const sendOTP = async (phoneNumber) => {
//   try {
//     const verification = await client.verify.v2
//       .services(VERIFY_SERVICE_ID)
//       .verifications.create({ to: `+91${phoneNumber}`, channel: "sms" });

//     return verification.status;
//   } catch (error) {
//     console.error("Error sending OTP:", error);
//     throw error;
//   }
// };

// // Verify OTP using Twilio Verify
// const verifyOTP = async (phoneNumber, otp) => {
//   try {
//     const verificationCheck = await client.verify.v2
//       .services(VERIFY_SERVICE_ID)
//       .verificationChecks.create({ to: `+91${phoneNumber}`, code: otp });

//     return verificationCheck.status === "approved";
//   } catch (error) {
//     console.error("Error verifying OTP:", error);
//     return false;
//   }
// };

// // Modified signup initiation
// const initiateSignup = async (req, res) => {
//   const { phoneNumber } = req.body;

//   if (!phoneNumber) {
//     return res.status(400).json({ error: "Phone number is required" });
//   }

//   try {
//     // Check if phone number already exists
//     const foundUserNumber = await User.findOne({ phoneNumber });
//     if (foundUserNumber) {
//       return res.status(409).json({ error: "Phone number already in use." });
//     }

//     // Send OTP using Twilio Verify
//     const status = await sendOTP(phoneNumber);

//     res.status(200).json({
//       success: true,
//       message: "OTP sent successfully",
//       data: { phoneNumber, status },
//     });
//   } catch (error) {
//     console.error("Error in initiateSignup:", error);
//     res.status(500).json({ error: "Failed to send OTP" });
//   }
// };

// // Complete signup with OTP verification
// const signup = async (req, res) => {
//   const { userName, email, password, profilePic, phoneNumber, otp } = req.body;

//   if (!userName || !email || !password || !phoneNumber || !otp) {
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   try {
//     // Verify OTP using Twilio Verify
//     const isValidOTP = await verifyOTP(phoneNumber, otp);
//     if (!isValidOTP) {
//       return res.status(400).json({ error: "Invalid or expired OTP" });
//     }

//     // Check if email already exists
//     const foundUserEmail = await User.findOne({ email });
//     if (foundUserEmail) {
//       return res.status(409).json({ error: "Email already in use." });
//     }

//     const isFirstUser = (await User.countDocuments({})) === 0;
//     const role = isFirstUser ? "admin" : "user";

//     const salt = await bcrypt.genSalt();
//     const hashedPassword = await bcrypt.hash(password, salt);

//     const newUser = new User({
//       userName,
//       email,
//       password: hashedPassword,
//       role,
//       profilePic,
//       phoneNumber,
//     });

//     await newUser.save();

//     const user = {
//       id: newUser._id,
//       name: newUser.userName,
//       role: newUser.role,
//     };

//     const token = jwt.sign(user, process.env.JWT_SECRET, {
//       expiresIn: process.env.JWT_EXPIRY,
//     });

//     res.status(201).json({
//       error: false,
//       success: true,
//       message: "User created successfully!",
//       data: { user, token },
//     });
//   } catch (error) {
//     console.error("Error in signup:", error);
//     res.status(500).json({ error: "Failed to create user" });
//   }
// };

// // Resend OTP if needed
// const resendOTP = async (req, res) => {
//   const { phoneNumber } = req.body;

//   if (!phoneNumber) {
//     return res.status(400).json({ error: "Phone number is required" });
//   }

//   try {
//     const status = await sendOTP(phoneNumber);
//     res.status(200).json({
//       success: true,
//       message: "OTP resent successfully",
//       status,
//     });
//   } catch (error) {
//     console.error("Error in resendOTP:", error);
//     res.status(500).json({ error: "Failed to resend OTP" });
//   }
// };

// // // Sign-up route
// // const signup = async (req, res) => {
// //   const { userName, email, password, profilePic, phoneNumber } = req.body;
// //   console.log("phoneNumber::: ", phoneNumber);

// //   if ((!userName || !email || !password, !phoneNumber)) {
// //     res.status(400).json({ status: true, message: "Missing fields" });
// //     return;
// //   }

// //   try {
// //     const foundUserEmail = await User.findOne({ email });
// //     const foundUserNumber = await User.findOne({ phoneNumber });

// //     if (foundUserEmail || foundUserNumber) {
// //       const errorMessage = foundUserEmail
// //         ? "Email already in use."
// //         : "Phone number already in use.";
// //       res.status(409).json({ error: errorMessage });
// //       return;
// //     }

// //     const isFirstUser = (await User.countDocuments({})) === 0;
// //     const role = isFirstUser ? "admin" : "user";

// //     const salt = await bcrypt.genSalt();
// //     const hashedPassword = await bcrypt.hash(password, salt);

// //     const newUser = new User({
// //       userName,
// //       email,
// //       password: hashedPassword,
// //       role,
// //       profilePic,
// //       phoneNumber,
// //     });

// //     await newUser.save();

// //     const user = {
// //       id: newUser._id,
// //       name: newUser.userName,
// //       role: newUser.role,
// //     };

// //     const token = jwt.sign(user, process.env.JWT_SECRET, {
// //       expiresIn: process.env.JWT_EXPIRY,
// //     });

// //     res.status(201).json({
// //       error: false,
// //       success: true,
// //       message: "User created successfully!",
// //       data: { user, token },
// //     });
// //   } catch (error) {
// //     console.error(error);
// //     res.status(500).json({ error: "Failed to create user" });
// //   }
// // };

// // login route
// const login = async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     res.status(400).json({ error: "Email and password are required." });
//     return;
//   }

//   const foundUser = await User.findOne({ email }).populate({
//     path: "addresses",
//     select: "street city state country zipCode",
//   });

//   if (!foundUser) {
//     res.status(401).json({ error: "User not found!" });
//     return;
//   }

//   const isMatch = await bcrypt.compare(password, foundUser.password);
//   if (!isMatch) {
//     res.status(401).json({ error: "Incorrect password!" });
//     return;
//   }

//   const user = {
//     id: foundUser._id,
//     name: foundUser.userName,
//     email: foundUser.email,
//     role: foundUser.role,
//     profilePic: foundUser.profilePic,
//   };

//   const token = jwt.sign(user, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRY,
//   });

//   const tokenOption = {
//     httpOnly: true,
//   };

//   res.cookie("token", token, tokenOption).status(200).json({
//     message: "Login successful",
//     data: { user, token },
//     success: true,
//     error: false,
//   });
// };

// const userDetails = async (req, res) => {
//   try {
//     const user = await User.findById(req.userId).populate("addresses").lean();

//     if (!user) {
//       return res.status(404).json({
//         message: "User not found",
//         error: true,
//         success: false,
//       });
//     }

//     const userData = {
//       id: user._id,
//       username: user.userName,
//       email: user.email,
//       role: user.role,
//       profilePic: user.profilePic,
//       phoneNumber: user.phoneNumber,
//       addresses: user.addresses, // Include addresses in response if needed
//     };

//     res.status(200).json({
//       data: userData,
//       error: false,
//       success: true,
//       message: "User details retrieved successfully",
//     });
//   } catch (err) {
//     console.error("Error fetching user details:", err);
//     res.status(500).json({
//       message: "Internal Server Error",
//       error: true,
//       success: false,
//     });
//   }
// };

// const logout = async (req, res, next) => {
//   try {
//     res.clearCookie("token");

//     res.status(200).json({
//       success: true,
//       message: "Logged out successfully",
//       error: false,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: error.message || "Internal Server Error",
//       error: true,
//       success: false,
//     });
//   }
// };

// const updateUser = async (req, res) => {
//   try {
//     const { username, email, password, profilePic } = req.body;
//     const userId = req.userId; // Assuming you have middleware that sets userId from the token

//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Update fields if provided
//     if (username) user.userName = username;
//     if (email) user.email = email;

//     // If password is provided, hash it before saving
//     if (password) {
//       const salt = await bcrypt.genSalt(10);
//       user.password = await bcrypt.hash(password, salt);
//     }
//     if (profilePic) user.profilePic = profilePic;

//     await user.save();

//     // Return updated user data (excluding password)

//     res.status(200).json({
//       message: "User updated successfully",
//       data: user,
//       success: true,
//       error: false,
//     });
//   } catch (error) {
//     console.error("Error updating user:", error);
//     res.status(500).json({
//       message: "Internal server error",
//       error: true,
//       success: false,
//     });
//   }
// };

// module.exports = {
//   login,
//   signup,
//   userDetails,
//   logout,
//   updateUser,
//   initiateSignup,
//   resendOTP,
// };

//commonController.js
// Import required modules
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { clearCookie } = require("cookie-parser");
const User = require("../../models/userModel");
const productModel = require("../../models/productModel");

// login route
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required." });
    return;
  }

  const foundUser = await User.findOne({ email }).populate({
    path: "addresses",
    select: "street city state country zipCode",
  });

  if (!foundUser) {
    res.status(401).json({ message: "User not found!" });
    return;
  }

  if (foundUser.isBlocked) {
    res.status(401).json({ message: "Your account has been blocked!" });
    return;
  }

  const isMatch = await bcrypt.compare(password, foundUser.password);
  if (!isMatch) {
    res.status(401).json({ message: "Incorrect password!" });
    return;
  }

  const user = {
    id: foundUser._id,
    name: foundUser.userName,
    email: foundUser.email,
    role: foundUser.role,
    profilePic: foundUser.profilePic,
  };

  const token = jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });

  const tokenOption = {
    httpOnly: true,
  };

  res.cookie("token", token, tokenOption).status(200).json({
    message: "Login successful",
    data: { user, token },
    success: true,
    error: false,
  });
};

// Sign-up route
const signup = async (req, res) => {
  const { userName, email, password, profilePic, phoneNumber } = req.body;

  if ((!userName || !email || !password, !phoneNumber)) {
    res.status(400).json({ status: true, message: "Missing fields" });
    return;
  }

  try {
    const foundUserEmail = await User.findOne({ email });
    const foundUserNumber = await User.findOne({ phoneNumber });

    if (foundUserEmail || foundUserNumber) {
      const errorMessage = foundUserEmail
        ? "Email already in use."
        : "Phone number already in use.";
      res.status(409).json({ error: errorMessage });
      return;
    }

    const isFirstUser = (await User.countDocuments({})) === 0;
    const role = isFirstUser ? "admin" : "user";

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      userName,
      email,
      password: hashedPassword,
      role,
      profilePic,
      phoneNumber,
    });

    await newUser.save();

    const user = {
      id: newUser._id,
      name: newUser.userName,
      role: newUser.role,
    };

    const token = jwt.sign(user, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY,
    });

    res.status(201).json({
      error: false,
      success: true,
      message: "User created successfully!",
      data: { user, token },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create user" });
  }
};

const userDetails = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("addresses").lean();

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    const userData = {
      id: user._id,
      username: user.userName,
      email: user.email,
      role: user.role,
      profilePic: user.profilePic,
      phoneNumber: user.phoneNumber,
      addresses: user.addresses, // Include addresses in response if needed
    };

    res.status(200).json({
      data: userData,
      error: false,
      success: true,
      message: "User details retrieved successfully",
    });
  } catch (err) {
    console.error("Error fetching user details:", err);
    res.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

const logout = async (req, res, next) => {
  try {
    res.clearCookie("token");

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { username, email, password, profilePic } = req.body;
    const userId = req.userId; // Assuming you have middleware that sets userId from the token

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields if provided
    if (username) user.userName = username;
    if (email) user.email = email;

    // If password is provided, hash it before saving
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    if (profilePic) user.profilePic = profilePic;

    await user.save();

    // Return updated user data (excluding password)

    res.status(200).json({
      message: "User updated successfully",
      data: user,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      message: "Internal server error",
      error: true,
      success: false,
    });
  }
};

const userAds = async (req, res) => {
  try {
    const userId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
        success: false,
        error: true,
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
        error: true,
      });
    }

    // Get total count of ads for pagination
    const totalAds = await productModel.countDocuments({ user: userId });
    const totalPages = Math.ceil(totalAds / limit);

    // Get paginated ads
    const ads = await productModel
      .find({ user: userId })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    if (!ads.length && page === 1) {
      return res.status(404).json({
        message: "No ads found for this user",
        success: false,
        error: true,
      });
    }

    res.status(200).json({
      message: "User ads fetched successfully",
      success: true,
      error: false,
      ads,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalAds,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching user ads:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
      error: true,
    });
  }
};
const userAdsDelete = async (req, res) => {
  try {
    const userId = req.userId;
    const adId = req.params.id;
    if (!userId || !adId) {
      return res.status(400).json({
        message: "User ID and ad ID are required",
        success: false,
      });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
    const ad = await productModel.findById(adId);
    if (!ad) {
      return res.status(404).json({
        message: "Ad not found",
        success: false,
      });
    }
    if (ad.user.toString() !== userId) {
      return res.status(403).json({
        message: "You do not have permission to delete this ad",
        success: false,
      });
    }
    await productModel.findByIdAndDelete(adId);
    res.status(200).json({
      message: "Ad deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error deleting user ads:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
      error: true,
    });
  }
};
module.exports = {
  login,
  signup,
  userDetails,
  logout,
  updateUser,
  userAds,
  userAdsDelete,
};
