const Category = require("../../../models/categoryModel");
const Product = require("../../../models/productModel");

const getAllCategories = async (req, res) => {
  try {
    // Fetch categories with pagination and sorting
    const categoryData = await Category.find().sort({
      name: 1,
    });

    if (categoryData.length > 0) {
      res.status(200).json({
        error: false,
        success: true,
        categories: categoryData,
      });
    } else {
      res.status(200).json({
        error: false,
        success: true,
        categories: [],
      });
    }
  } catch (err) {
    res.status(500).json({ error: true, success: false, message: err.message });
  }
};

// Get category by ID with subcategories and products
const getCategoryById = async (req, res) => {
  const id = req.params.id;

  try {
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        error: true,
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      error: false,
      success: true,
      category,
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({
      error: true,
      success: false,
      message: err.message,
    });
  }
};

const getProductByCategoryId = async (req, res) => {
  const categoryId = req.params.id;
  const { search } = req.query;

  try {
    // Build the query
    let query = {
      category: categoryId,
      isActive: true,
    };

    // Add search functionality if search parameter exists
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Add pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    // Fetch products with pagination
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("category", "name")
      .lean();

    if (products.length > 0) {
      res.status(200).json({
        error: false,
        success: true,
        products: products,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          hasMore: page * limit < total,
        },
      });
    } else {
      res.status(200).json({
        error: false,
        success: true,
        message: "No products found for this category.",
        products: [],
        pagination: {
          total: 0,
          page,
          pages: 0,
          hasMore: false,
        },
      });
    }
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({
      error: true,
      success: false,
      message: "Server error: " + err.message,
    });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  getProductByCategoryId,
};
