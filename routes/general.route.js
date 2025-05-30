const express = require('express');
const User = require('../models/User.model');
const { protect } = require('../middleware/auth.middleware');
const router = express.Router();



// GET /api/general/me — Get current user's data (protected route)
router.get('/me', protect, async (req, res) => {
  try {
    // req.user is already populated by the protect middleware
    res.status(200).json(req.user);
  } catch (err) {
    console.error('Error fetching current user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;