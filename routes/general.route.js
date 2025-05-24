const express = require('express');
const User = require('../models/User.model');
const router = express.Router();

// GET /api/general/users — Get all users (public endpoint, no auth required)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;