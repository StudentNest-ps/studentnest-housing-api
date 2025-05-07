const express = require('express');
const Chat = require('../models/Chat.model');
const Message = require('../models/Message.model');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// POST /api/messages — Send a message
router.post('/', protect, async (req, res) => {
  const { senderId, receiverId, message, chatId } = req.body;

  try {
    let chat = chatId
      ? await Chat.findById(chatId)
      : await Chat.findOne({ participants: { $all: [senderId, receiverId] } });

    if (!chat) {
      chat = await Chat.create({ participants: [senderId, receiverId] });
    }

    const newMessage = await Message.create({
      chatId: chat._id,
      senderId,
      receiverId,
      message
    });

    res.status(201).json(newMessage);
  } catch (err) {
    console.error('Message error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/messages/:chatId — Get all messages in a chat
router.get('/:chatId', protect, async (req, res) => {
  try {
    const messages = await Message.find({ chatId: req.params.chatId }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
