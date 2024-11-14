//commonController.js
// Import required modules
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { clearCookie } = require("cookie-parser");
const User = require("../../models/userModel");

// login route
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required." });
    return;
  }

  const foundUser = await User.findOne({ email }).populate({
    path: "addresses",
    select: "street city state country zipCode",
  });

  if (!foundUser) {
    res.status(401).json({ error: "User not found!" });
    return;
  }

  const isMatch = await bcrypt.compare(password, foundUser.password);
  if (!isMatch) {
    res.status(401).json({ error: "Incorrect password!" });
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
  console.log("phoneNumber::: ", phoneNumber);

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

module.exports = { login, signup, userDetails, logout, updateUser };
