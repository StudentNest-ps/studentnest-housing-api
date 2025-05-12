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
router.get('/users', async (_, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

// GET /api/admin/users/role/:role
router.get('/users/role/:role', async (req, res) => {
  const { role } = req.params;
  
  // Validate role parameter
  if (!['student', 'owner', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role. Must be student, owner, or admin' });
  }
  
  const users = await User.find({ role }).select('-password');
  res.json(users);
});

// GET /api/admin/properties
router.get('/properties', async (_, res) => {
  try {
    const properties = await Property.find()
      .populate({
        path: 'ownerId',
        select: 'username phoneNumber' // Only select the fields we need
      });
    
    // Transform the response to include owner info directly
    const propertiesWithOwnerInfo = properties.map(property => {
      const propertyObj = property.toObject();
      return {
        ...propertyObj,
        ownerName: propertyObj.ownerId?.username || 'Unknown',
        ownerPhoneNumber: propertyObj.ownerId?.phoneNumber || 'Unknown',
        ownerId: propertyObj.ownerId?._id // Keep the original ownerId
      };
    });
    
    res.json(propertiesWithOwnerInfo);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching properties', error: error.message });
  }
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
router.get('/analytics', async ( _, res) => {
  const userCount = await User.countDocuments();
  const propertyCount = await Property.countDocuments();
  const bookingCount = await Booking.countDocuments();
  const recentSignups = await User.find().sort({ createdAt: -1 }).limit(5);
  res.json({ userCount, propertyCount, bookingCount, recentSignups });
});
module.exports = router;
