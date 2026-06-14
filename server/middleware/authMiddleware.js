const jwt = require('jsonwebtoken');

/**
 * Middleware to protect private routes using JSON Web Tokens.
 */
const protect = async (req, res, next) => {
  let token;

  // Check if token exists in the Authorization header and follows Bearer format
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user information to request
      req.user = decoded;

      next();
    } catch (error) {
      console.error(`JWT verification error: ${error.message}`);
      return res.status(401).json({
        error: {
          message: 'Not authorized, token failed',
          status: 401
        }
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      error: {
        message: 'Not authorized, no token provided',
        status: 401
      }
    });
  }
};

module.exports = { protect };
