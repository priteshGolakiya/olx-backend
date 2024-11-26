const Product = require("../../../models/productModel");

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
        select: "userName email profilePic phoneNumber addresses totalProductRejections",
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
    console.log("products::: ", products);
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
    console.log("productId::: ", productId);
    const { status } = req.body;

    // Validate status
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be approved or rejected.",
      });
    }

    // Find the product
    const product = await Product.findById(productId)
      .populate("user")
      .populate("category");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Update product status
    product.status = status;

    // If rejected, update rejection details
    if (status === "rejected") {
      product.rejectionDetails.count += 1;
      product.rejectionDetails.lastRejectedAt = new Date();

      // Optional: Increment user's total product rejections
      const user = product.user;
      user.totalProductRejections = (user.totalProductRejections || 0) + 1;

      // // Check if user should be restricted
      // if (user.totalProductRejections >= user.rejectionThreshold) {
      //   user.isBlocked = true;
      // }

      await user.save();
    }
    console.log("product::: ", product);

    await product.save();

    res.status(200).json({
      success: true,
      message: `Product ${status} successfully`,
      data: product,
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

module.exports = {
  getApprovalRequests,
  approveRequest,
  bulkProcessProducts,
};
