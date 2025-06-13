const express = require('express');
const Chat = require('../models/Chat.model');
const Message = require('../models/Message.model');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// POST /api/messages — Send a message
router.post('/', protect, async (req, res) => {
  const { senderId, receiverId, message, propertyId } = req.body;

  try {
    let chat = await Chat.findOne({
      participants: { $all: [senderId, receiverId], $size: 2 },
      propertyId
    });

    if (!chat) {
      chat = await Chat.create({
        participants: [senderId, receiverId],
        propertyId
      });
    }

    const newMessage = await Message.create({
      chatId: chat._id,
      senderId,
      receiverId,
      propertyId,
      message
    });

    res.status(201).json(newMessage);
  } catch (err) {
    console.error('Message error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

//  GET /api/messages/thread?senderId=...&receiverId=...&propertyId=...
router.get('/thread', protect, async (req, res) => {
  const { senderId, receiverId, propertyId } = req.query;

  try {
    if (!senderId || !receiverId || !propertyId) {
      return res.status(400).json({ message: 'senderId, receiverId, and propertyId are required' });
    }

    const messages = await Message.find({
      propertyId,
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    console.error('Error fetching thread:', err);
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

// GET /api/messages/property/:propertyId — Get all chats related to a property
router.get('/property/:propertyId', protect, async (req, res) => {
  try {
    const messages = await Message.find({ propertyId: req.params.propertyId });
    const chatIds = [...new Set(messages.map(m => m.chatId.toString()))];
    const chats = await Chat.find({ _id: { $in: chatIds } })
      .populate('participants', 'name email profilePicture');

    res.status(200).json(chats);
  } catch (err) {
    console.error('Get chats by property error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
