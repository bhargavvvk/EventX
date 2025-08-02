// @desc    Login user (either student or club-admin)
// @route   POST /api/auth/login
// @access  Public

const User = require('../models/User');

const loginUser = async (req, res) => {
    const { username, password } = req.body;
  
    try {
      const user = await User.findOne({ username });
      
      if (!user) {
        console.log('User not found');
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      console.log('User found, checking password...');
      const passwordMatch = await user.matchPassword(password);
      console.log('Password match result:', passwordMatch);
      
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      res.status(200).json({
        _id: user._id,
        username: user.username,
        role: user.role,
        club: user.club,
      });
    } catch (err) {
      console.error('Login error:', err.message);
      res.status(500).json({ message: 'Server error' });
    }
  };

module.exports = { loginUser };

