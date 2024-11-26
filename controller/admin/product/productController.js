const Product = require("../../../models/productModel");
const User = require("../../../models/userModel");

// Get all pending products
const getApprovalRequests = async (req, res) => {
  try {
    // Pagination and filtering
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { status: "pending" };

    // Fetch products with populated user and category
    const products = await Product.find(query)
      .populate({
        path: "user",
        select:
          "userName email profilePic phoneNumber addresses totalProductRejections",
        populate: {
          path: "addresses",
          select: "street city state zipCode",
        },
      })
      .populate({
        path: "category",
        select: "name",
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Count total pending products
    const totalProducts = await Product.countDocuments(query);
    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalProducts / limit),
        totalProducts,
      },
    });
  } catch (error) {
    console.error("Error fetching approval requests:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product approval requests",
      error: error.message,
    });
  }
};

// Approve or reject a product
const approveRequest = async (req, res) => {
  try {
    const { productId } = req.params;
    const { status } = req.body;

    // Validate status
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be approved or rejected.",
      });
    }

    // Find the product with populated user
    const product = await Product.findById(productId).populate("user");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Find the associated user
    const user = await User.findById(product.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Associated user not found",
      });
    }

    // Update product status
    product.status = status;

    // Handle rejection logic
    if (status === "rejected") {
      // Increment rejection details for the product
      product.rejectionDetails.count += 1;
      product.rejectionDetails.lastRejectedAt = new Date();

      // Increment user's total product rejections
      user.totalProductRejections += 1;

      // // Optional: Check if user should be restricted
      // if (user.totalProductRejections >= user.rejectionThreshold) {
      //   user.isBlocked = true;
      // }
    } else if (status === "approved") {
      // Reset rejection details if the product is approved
      product.rejectionDetails.count = 0;
      product.rejectionDetails.lastRejectedAt = null;
      user.totalProductRejections -= 1;
    }

    // Save changes
    await product.save();
    await user.save();

    res.status(200).json({
      success: true,
      message: `Product ${status} successfully`,
      data: {
        product,
        user: {
          totalProductRejections: user.totalProductRejections,
          isBlocked: user.isBlocked,
        },
      },
    });
  } catch (error) {
    console.error("Error processing product request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process product request",
      error: error.message,
    });
  }
};

const bulkProcessProducts = async (req, res) => {
  try {
    const { productIds, status } = req.body;

    // Validate input
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid product IDs",
      });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be approved or rejected.",
      });
    }

    // Bulk update products
    const result = await Product.updateMany(
      { _id: { $in: productIds }, status: "pending" },
      {
        status,
        $inc: { "rejectionDetails.count": status === "rejected" ? 1 : 0 },
      }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} products ${status} successfully`,
      data: result,
    });
  } catch (error) {
    console.error("Error in bulk product processing:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process products in bulk",
      error: error.message,
    });
  }
};

const getRejectProduct = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { status: "rejected" };

    // Fetch rejected products with populated user and category
    const rejectedProducts = await Product.find(query)
      .populate({
        path: "user",
        select:
          "userName email profilePic phoneNumber addresses totalProductRejections",
        populate: {
          path: "addresses",
          select: "street city state zipCode",
        },
      })
      .populate({
        path: "category",
        select: "name",
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Count total rejected products
    const totalRejectedProducts = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      data: rejectedProducts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalRejectedProducts / limit),
        totalRejectedProducts,
      },
    });
  } catch (error) {
    console.error("Error fetching rejected products:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch rejected products",
      error: error.message,
    });
  }
};

// Get all products
const getAllProduct = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filtering by category, status, or user (optional)
    const filter = {};
    if (req.query.categoryId) {
      filter.category = req.query.categoryId;
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.userId) {
      filter.user = req.query.userId;
    }

    // Sorting (optional, defaults to descending order by creation date)
    const sortField = req.query.sortField || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    // Fetch all products with populated user and category
    const products = await Product.find(filter)
      .populate({
        path: "user",
        select:
          "userName email profilePic phoneNumber addresses totalProductRejections",
        populate: {
          path: "addresses",
          select: "street city state zipCode",
        },
      })
      .populate({
        path: "category",
        select: "name",
      })
      .skip(skip)
      .limit(limit)
      .sort(sort);

    // Count total products matching the filter
    const totalProducts = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalProducts / limit),
        totalProducts,
      },
    });
  } catch (error) {
    console.error("Error fetching all products:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch all products",
      error: error.message,
    });
  }
};

module.exports = {
  getApprovalRequests,
  approveRequest,
  bulkProcessProducts,
  getRejectProduct,
  getAllProduct,
};
