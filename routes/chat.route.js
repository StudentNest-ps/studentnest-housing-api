const express = require('express');
const Chat = require('../models/Chat.model');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user.id }).populate('participants', 'username email');
    res.status(200).json(chats);
  } catch (err) {
    console.error('Chats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;