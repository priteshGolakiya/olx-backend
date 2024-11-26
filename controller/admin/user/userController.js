const Product = require("../../../models/productModel");
const User = require("../../../models/userModel");

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -otp").lean().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
};

// Toggle user restriction (block/unblock)
const toggleUserRestriction = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Toggle the isBlocked status
    const isBlockingUser = !user.isBlocked;
    user.isBlocked = isBlockingUser;

    // Find all products by this user
    const userProducts = await Product.find({ user: user._id });

    // Update product status based on user blocking/unblocking
    if (userProducts.length > 0) {
      const updatePromises = userProducts.map(async (product) => {
        if (isBlockingUser) {
          // If blocking user, reject all their products
          product.status = "rejected";
          product.rejectionDetails.count += 1;
          product.rejectionDetails.lastRejectedAt = new Date();

          // Increment user's total product rejections
          user.totalProductRejections += 1;
        } else {
          // If unblocking user, set products back to pending
          product.status = "pending";
          product.rejectionDetails.count = 0;
          product.rejectionDetails.lastRejectedAt = null;
        }
        return product.save();
      });

      await Promise.all(updatePromises);
    }

    // Save user after updating rejection count
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isBlocked ? "blocked" : "unblocked"} successfully`,
      data: {
        userId: user._id,
        isBlocked: user.isBlocked,
        totalProductRejections: user.totalProductRejections,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating user restriction status",
      error: error.message,
    });
  }
};

// New API to check product rejection details
const checkUserProductRejections = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find all rejected products for this user
    const rejectedProducts = await Product.find({
      user: user._id,
      status: "rejected",
    }).select("title rejectionDetails status");

    // Check if user should be automatically restricted
    const shouldRestrict =
      user.totalProductRejections >= user.rejectionThreshold;

    res.status(200).json({
      success: true,
      data: {
        totalProductRejections: user.totalProductRejections,
        rejectionThreshold: user.rejectionThreshold,
        shouldRestrict,
        rejectedProducts,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching product rejection details",
      error: error.message,
    });
  }
};

// Update rejection threshold for a user
const updateRejectionThreshold = async (req, res) => {
  try {
    const { userId } = req.params;
    const { threshold } = req.body;

    if (!threshold || threshold < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid threshold value",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.rejectionThreshold = threshold;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Rejection threshold updated successfully",
      data: {
        userId: user._id,
        newThreshold: user.rejectionThreshold,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating rejection threshold",
      error: error.message,
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if trying to delete an admin
    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin users cannot be deleted",
      });
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: {
        deletedUserId: userId,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message,
    });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role specified",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: {
        userId: user._id,
        newRole: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating user role",
      error: error.message,
    });
  }
};

// Get user details by ID
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select("-password -otp")
      .populate("addresses")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user details",
      error: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  toggleUserRestriction,
  deleteUser,
  updateUserRole,
  getUserById,
  checkUserProductRejections,
  updateRejectionThreshold,
};
