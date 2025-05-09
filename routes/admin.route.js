const express = require('express');
const User = require('../models/User.model');
const Property = require('../models/Property.model');
const Booking = require('../models/booking.model');
const { protect } = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/admin.middleware');

const router = express.Router();

// Middleware: must be logged in and an admin
router.use(protect, isAdmin);

// GET /api/admin/users
router.get('/users', async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

// GET /api/admin/properties
router.get('/properties', async (req, res) => {
  const properties = await Property.find();
  res.json(properties);
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
});

// DELETE /api/admin/properties/:id
router.delete('/properties/:id', async (req, res) => {
  await Property.findByIdAndDelete(req.params.id);
  res.json({ message: 'Property deleted' });
});

// GET /api/admin/analytics
router.get('/analytics', async (req, res) => {
  const userCount = await User.countDocuments();
  const propertyCount = await Property.countDocuments();
  const bookingCount = await Booking.countDocuments();
  const recentSignups = await User.find().sort({ createdAt: -1 }).limit(5);
  res.json({ userCount, propertyCount, bookingCount, recentSignups });
});
module.exports = router;
