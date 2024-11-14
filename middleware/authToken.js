const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

// Middleware to check if user has a valid token
const checkToken = (req, res, next) => {
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
    return res.status(401).json({
      message: "Unauthorized: No token provided",
      success: false,
      error: true,
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log('err::: ', err);
      return res.status(401).json({
        message: "Invalid token or token is expired",
        success: false,
        error: true,
      });
    }

    req.userId = decoded.id;
    next();
  });
};
module.exports = checkToken;
