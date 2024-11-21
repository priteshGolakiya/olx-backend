require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const connectDB = require("./db/connection");
const errorHandler = require("./middleware/errorHandler");
const adminAuthMiddleware = require("./middleware/adminAuthMiddleware");
const checkToken = require("./middleware/authToken");

// Import routes
const commonRoutes = require("./routes/common/common");
const commonAddressRoutes = require("./routes/common/commonAddressRouter");
const commonCategoryRoutes = require("./routes/common/commonCategoryRoutes");
const commonProductRoutes = require("./routes/common/commonProductRoutes");
const userRoutes = require("./routes/admin/userRoutes.js");
const categoryRoutes = require("./routes/admin/categoryRoutes");
const productRoutes = require("./routes/admin/productRoutes.js");

const app = express();

// Middleware
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "50mb" }));

// Apply adminAuthMiddleware to all /admin routes
app.use("/admin", adminAuthMiddleware);

// Admin Routes
app.use("/admin/user", userRoutes);
app.use("/admin/category", categoryRoutes);
app.use("/admin/product", productRoutes);

// Common Routes
app.use("/", commonRoutes);
app.use("/address", checkToken, commonAddressRoutes);
app.use("/category", commonCategoryRoutes);
app.use("/product", commonProductRoutes);
// Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
