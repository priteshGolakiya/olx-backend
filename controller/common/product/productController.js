const Address = require("../../../models/addressModel");
const Product = require("../../../models/productModel");
const Category = require("../../../models/categoryModel");

const getAllProduct = async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = { isActive: true, status: "approved" };

    // If there's a search query
    if (search) {
      // First, find categories that match the search term
      const matchingCategories = await Category.find({
        name: { $regex: search, $options: "i" },
      }).select("_id");

      // Extract category IDs
      const categoryIds = matchingCategories.map((cat) => cat._id);

      // Build the query to search in both product details and matching categories
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $in: categoryIds } }, // Add products from matching categories
      ];
    }

    // Add specific category filter if provided
    if (category && category !== "all") {
      // If we already have an $or condition from search
      if (query.$or) {
        // Wrap existing conditions in $and to combine with category filter
        query = {
          $and: [{ $or: query.$or }, { category: category }],
        };
      } else {
        // Simply add category to query if no search conditions
        query.category = category;
      }
    }

    // Add pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    // Fetch products with sorting by latest
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "category",
        select: "name",
      })
      .lean();

    // Filter out products where category population failed (inactive categories)
    const filteredProducts = products.filter((product) => product.category);

    return res.status(200).json({
      success: true,
      products: filteredProducts,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    console.error("Product retrieval error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "An error occurred while retrieving products.",
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findOne({
      _id: productId,
      isActive: true,
    })
      .populate({
        path: "user", // Populating the `user` field
        select: "-password", // Excluding the `password` field
      })
      .populate({
        path: "category", // Populating the `category` field from `Category` model
      });

    // If the product doesn't exist or is inactive
    const addressData = await Address.find({ user: product.user._id });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or is inactive.",
      });
    }

    const filterData = {
      id: product._id,
      title: product.title,
      description: product.description,
      price: product.price,
      image: product.images,
      isActive: product.isActive,
      user: product.user,
      address: addressData,
      category: product.category.name,
      categoryId: product.category._id,
    };
    // Return the product with populated user, address, and category details
    return res.status(200).json({
      success: true,
      product: filterData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message:
        error.message || "An error occurred while retrieving the product.",
    });
  }
};

const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { search } = req.query;

    let query = {
      category: categoryId,
      isActive: true,
      status: "approved",
    };

    // Add search functionality within category
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

    // Fetch products
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("category", "name")
      .lean();

    return res.status(200).json({
      success: true,
      products,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    console.error("Category products retrieval error:", error);
    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "An error occurred while retrieving category products.",
    });
  }
};

const getUserProduct = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {
      userId: req.user._id,
    };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("category", "name")
      .lean();

    return res.status(200).json({
      success: true,
      products,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    console.error("User products retrieval error:", error);
    return res.status(500).json({
      success: false,
      message:
        error.message || "An error occurred while retrieving user products.",
    });
  }
};

const uploadProduct = async (req, res) => {
  try {
    const { title, price, description, category, imageUrl } = req.body;

    if (!title || !price || !description || !category) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields: title, price, description, and category.",
      });
    }

    const newProduct = new Product({
      user: req.userId,
      title,
      price,
      description,
      category,
      images: imageUrl,
      isActive: true,
    });

    const savedProduct = await newProduct.save();

    return res.status(201).json({
      success: true,
      message: "Product uploaded successfully.",
      product: savedProduct,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message:
        error.message || "An error occurred while uploading the product.",
    });
  }
};

const sellProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findByIdAndUpdate(
      productId,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product sold successfully. It is now inactive.",
      product,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "An error occurred while selling the product.",
    });
  }
};

const editProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const updatedData = req.body;

    const allowedFields = [
      "title",
      "price",
      "description",
      "isActive",
      "category",
    ];
    const updateFields = {};

    for (let field of allowedFields) {
      if (updatedData[field]) {
        updateFields[field] = updatedData[field];
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      product: updatedProduct,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "An error occurred while editing the product.",
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const deletedProduct = await Product.findByIdAndUpdate(
      productId,
      { isActive: false },
      { new: true }
    );

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully. It is now inactive.",
      product: deletedProduct,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "An error occurred while deleting the product.",
    });
  }
};

module.exports = {
  getAllProduct,
  getProductById,
  sellProduct,
  editProduct,
  deleteProduct,
  uploadProduct,
  getUserProduct,
  getProductsByCategory,
};
