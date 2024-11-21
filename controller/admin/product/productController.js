const Product = require("../../../models/productModel");

// Get all pending products
const getApprovalRequests = async (req, res) => {
  try {
    const products = await Product.find({ status: "pending" });

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

// Approve or reject a product
const approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ["approved", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status",
        message: "Status must be either 'approved' or 'rejected'",
      });
    }

    // Find and update product
    const product = await Product.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

module.exports = {
  getApprovalRequests,
  approveRequest,
};
