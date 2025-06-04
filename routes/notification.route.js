const express = require('express');
const Notification = require('../models/Notification.model');
const { protect } = require('../middleware/auth.middleware');
const mongoose = require('mongoose');

const router = express.Router();

// GET /api/notifications — Get user's notifications
router.get('/', protect, async (req, res) => {
  try {
    const allNotifications = await Notification.find({});
  console.log(allNotifications);
    const notifications = await Notification.find({
      userId: new mongoose.Types.ObjectId(req.user.id),
    }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/notifications — Create a notification
router.post('/', protect, async (req, res) => {
  const { userId, message, type } = req.body;
  try {
    const newNotification = await Notification.create({ userId, message, type });
    res.status(201).json(newNotification);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/notifications/:id/seen — Mark as read
router.put('/:id/seen', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification || notification.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Notification not found or not authorized' });
    }
    notification.seen = true;
    await notification.save();
    res.status(200).json({ message: 'Marked as seen' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
