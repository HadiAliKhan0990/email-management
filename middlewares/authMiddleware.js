const jwt = require('jsonwebtoken');

const verifyToken = async (req, res, next) => {
  let token = req.headers["authorization"];

  if (!token) {
    return res.status(403).send({
      status: false,
      status_msg: "A token is required for authentication",
      data: undefined
    });
  }

  token = token.split(" ")[1];
  
  try {
    // Get JWT secret from environment (support multiple variable names for compatibility)
    const jwtSecret = process.env.AUTH_KEY || process.env.JWT_SECRET || process.env.JWT_SECRET_KEY;
    
    // Check if any JWT secret is set
    if (!jwtSecret) {
      console.error('JWT secret is not set in environment variables');
      console.error('Checked for: AUTH_KEY, JWT_SECRET, JWT_SECRET_KEY');
      return res.status(500).send({
        status: false,
        status_msg: "Server configuration error: JWT secret not set (AUTH_KEY, JWT_SECRET, or JWT_SECRET_KEY required)",
        data: undefined
      });
    }

    // Log which key is being used (without exposing the actual key)
    const keyName = process.env.AUTH_KEY ? 'AUTH_KEY' : (process.env.JWT_SECRET ? 'JWT_SECRET' : 'JWT_SECRET_KEY');
    console.log(`Using ${keyName} for JWT verification (length: ${jwtSecret.length})`);

    const decoded = jwt.verify(token, jwtSecret);
    
    // Add decoded user info to request object
    req.user = decoded;
    return next();
  } catch (err) {
    // Log the specific error for debugging
    console.error('JWT Verification Error:', err.message);
    const jwtSecret = process.env.AUTH_KEY || process.env.JWT_SECRET || process.env.JWT_SECRET_KEY;
    const keyName = process.env.AUTH_KEY ? 'AUTH_KEY' : (process.env.JWT_SECRET ? 'JWT_SECRET' : 'JWT_SECRET_KEY');
    console.error(`${keyName} exists:`, !!jwtSecret);
    console.error(`${keyName} length:`, jwtSecret ? jwtSecret.length : 0);
    console.error('Available env vars:', {
      AUTH_KEY: !!process.env.AUTH_KEY,
      JWT_SECRET: !!process.env.JWT_SECRET,
      JWT_SECRET_KEY: !!process.env.JWT_SECRET_KEY
    });
    
    // Provide more specific error messages
    let errorMessage = "Invalid Token";
    if (err.name === 'JsonWebTokenError') {
      errorMessage = "Invalid token signature. Please check AUTH_KEY configuration.";
    } else if (err.name === 'TokenExpiredError') {
      errorMessage = "Token has expired";
    } else if (err.name === 'NotBeforeError') {
      errorMessage = "Token not active yet";
    }
    
    return res.status(401).send({
      status: false,
      status_msg: errorMessage,
      data: undefined
    });
  }
};

// Optional middleware for admin-only routes
const requireAdmin = async (req, res, next) => {
  try {
    // Check if user is admin (you can customize this based on your user categories)
    if (req.user.user_category !== 2) { // Assuming category_id 2 is admin
      return res.status(403).send({
        status: false,
        status_msg: "Access denied. Admin privileges required.",
        data: undefined
      });
    }
    return next();
  } catch (error) {
    return res.status(500).send({
      status: false,
      status_msg: "Error checking admin privileges.",
      data: undefined
    });
  }
};

module.exports = { verifyToken, requireAdmin }; 