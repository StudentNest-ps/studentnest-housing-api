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

// PATCH /api/general/me — Update current user's username, phoneNumber, or password
router.put('/me', protect, async (req, res) => {
  try {
    const { username, phoneNumber, password } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (username) user.username = username;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (password) user.password = password; // Will be hashed by pre-save hook

    await user.save();

    res.status(200).json({ message: 'User profile updated successfully.' });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;