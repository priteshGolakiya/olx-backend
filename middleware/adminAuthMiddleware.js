const jwt = require("jsonwebtoken");

// Middleware to check if user has a valid token and admin privileges
const adminAuthMiddleware = async (req, res, next) => {
  let headerToken = null;

  // Check for Authorization header
  if (req.headers.authorization) {
    const authHeader = req.headers.authorization;
    const tokenParts = authHeader.split(" ");
    if (tokenParts.length === 2 && tokenParts[0].toLowerCase() === "bearer") {
      headerToken = tokenParts[1];
    }
  }

  // Extract token from cookies or use headerToken
  const token = req.cookies.token || headerToken;

  if (!token) {
    res.status(401);
    throw new Error("Unauthorized: Token missing");
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the user has admin privileges
    if (decoded.role !== "admin") {
      res.status(403);
      throw new Error("Forbidden: Admin access required");
    }

    // Store decoded user data in request object
    req.userData = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = adminAuthMiddleware;
