const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded);

      // Get user from the token - handle both token structures
      const userId = decoded.id || decoded.user?._id;
      console.log('User ID from token:', userId);
      
      if (!userId) {
        return res.status(401).json({ message: 'Invalid token structure' });
      }
      
      req.user = await User.findById(userId).select('-password');
      console.log('User found in middleware:', req.user);

      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
