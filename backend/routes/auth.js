const express = require('express');
const router = express.Router();
const { loginUser } = require('../controllers/authController');

// @route   POST /api/auth/login
// @desc    Login user (student or club-admin)
// @access  Public

router.post('/login', loginUser);

module.exports = router;
