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
      
      // Try to find user in database
      req.user = await User.findById(userId).select('-password');
      console.log('User found in middleware:', req.user);
      
      // If user not found in database but token is valid, use token data
      if (!req.user && decoded.user) {
        console.log('User not found in DB, using token data');
        req.user = {
          _id: decoded.user._id,
          username: decoded.user.username,
          role: decoded.user.role
        };
      }
      
      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

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
